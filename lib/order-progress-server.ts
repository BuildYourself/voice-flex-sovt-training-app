import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getKitForOrder } from "@/lib/kits";
import { isVoiceFlexProduct, type VoiceFlexProduct } from "@/lib/training-product";

export type ProductMatch = {
  productType: VoiceFlexProduct;
  productName: "Voice Flex GO" | "Voice Flex Pro" | "Voice Flex Core";
  trainingRoute: `/train/${VoiceFlexProduct}`;
};

export type ServerEnvironment = {
  supabaseUrl: string;
  serviceRoleKey: string;
  goAsin: string;
  proAsin: string;
};

export type AmazonOrderAccessRow = {
  id: string;
  amazon_order_number: string;
  asin: string | null;
  source_asin: string | null;
  shipped: boolean | null;
  /** Orders with 2+ units or 2 products, e.g. {"pro": {"units": 2, "source_asin": "B0HFKM5D8V"}}. */
  products?: unknown;
};

/** One training product inside an order. units = how many people can each get their own profile. */
export type OrderProductEntry = {
  productType: VoiceFlexProduct;
  productName: ProductMatch["productName"];
  units: number;
  sourceAsin: string;
};

export type OrderProgressRow = {
  id?: string;
  order_access_id: string;
  product_type: VoiceFlexProduct;
  current_day: number | null;
  onboarding_completed: boolean | null;
  practice_streak: number | null;
  total_seconds: number | null;
  exercises_completed_count: number | null;
  full_sessions_completed: number | null;
  last_practice_date: string | null;
  profile_slot?: number | null;
  profile_name?: string | null;
  settings?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type DailyActivityRow = {
  id?: string;
  order_access_id: string;
  product_type: VoiceFlexProduct;
  activity_date: string;
  program_day: number | null;
  completed_exercise_ids: string[] | null;
  completed_exercise_titles: string[] | null;
  seconds_practiced: number | null;
  full_session_completed: boolean | null;
  last_exercise_id: string | null;
  last_exercise_title: string | null;
  profile_slot?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export const SERVER_ERROR_RESPONSE = {
  ok: false,
  status: "server_error",
  message: "We couldn't verify your order right now. Please try again later.",
} as const;

export function normalizeAsin(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

/**
 * Order numbers are stored upper-case with no spaces. Website (Shopify) orders are stored
 * as "SY1006", so "#SY1006", "sy 1006" and "SY1006" all find the same row.
 */
export function normalizeOrderNumber(value: string | null | undefined) {
  return (value ?? "").trim().replace(/^#/, "").replace(/\s+/g, "").toUpperCase();
}

const CORE_ASINS = new Set(["B0HFRD6FF4", "B0HFRJBX5L"]);

const PRODUCT_NAMES: Record<VoiceFlexProduct, ProductMatch["productName"]> = {
  go: "Voice Flex GO",
  pro: "Voice Flex Pro",
  core: "Voice Flex Core",
};

/** Pro > Core > GO, the same order the VPS sync uses to pick an order's main product. */
const PRODUCT_RANK: Record<VoiceFlexProduct, number> = { pro: 3, core: 2, go: 1 };

/** The database allows profile slots 1-50. */
export const MAX_PROFILE_SLOTS = 50;

function productMatchFor(productType: VoiceFlexProduct): ProductMatch {
  return { productType, productName: PRODUCT_NAMES[productType], trainingRoute: `/train/${productType}` };
}

export function getOrderProducts(row: AmazonOrderAccessRow, primary: ProductMatch): OrderProductEntry[] {
  const entries: OrderProductEntry[] = [];
  const raw = row.products;

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (!isVoiceFlexProduct(key) || !value || typeof value !== "object") continue;
      const item = value as { units?: unknown; source_asin?: unknown };
      const units = Math.max(1, Math.min(MAX_PROFILE_SLOTS, Math.floor(Number(item.units) || 1)));
      const sourceAsin = normalizeAsin(typeof item.source_asin === "string" ? item.source_asin : "");
      entries.push({ productType: key, productName: PRODUCT_NAMES[key], units, sourceAsin });
    }
  }

  if (!entries.some((entry) => entry.productType === primary.productType)) {
    entries.push({
      productType: primary.productType,
      productName: primary.productName,
      units: 1,
      sourceAsin: normalizeAsin(row.source_asin) || normalizeAsin(row.asin),
    });
  }

  return entries.sort((a, b) => PRODUCT_RANK[b.productType] - PRODUCT_RANK[a.productType]);
}

/** A profile slot from a request: a whole number from 1 up to the units bought, else null. */
export function parseProfileSlot(value: unknown, seats: number) {
  const slot = Number(value);
  if (!Number.isInteger(slot) || slot < 1 || slot > Math.min(seats, MAX_PROFILE_SLOTS)) return null;
  return slot;
}

/** The profile a progress request is for: missing means the first person; an invalid slot is refused. */
export function requestProfileSlot(value: unknown, seats: number) {
  if (value === undefined || value === null || value === "") return 1;
  return parseProfileSlot(value, seats);
}

export const PROFILE_NOT_FOUND = {
  ok: false,
  status: "profile_not_found",
  message: "We couldn't find this training profile on your order. Please enter your order number again.",
} as const;

export function normalizeProfileName(value: unknown) {
  if (typeof value !== "string") return null;
  const name = value.replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 24);
  return name || null;
}

export function getProductMatch(
  asin: string,
  env: Pick<ServerEnvironment, "goAsin" | "proAsin">,
): ProductMatch | null {
  const normalizedAsin = normalizeAsin(asin);
  if (!normalizedAsin) return null;
  if (CORE_ASINS.has(normalizedAsin)) return { productType: "core", productName: "Voice Flex Core", trainingRoute: "/train/core" };
  if (normalizedAsin === normalizeAsin(env.goAsin)) {
    return {
      productType: "go",
      productName: "Voice Flex GO",
      trainingRoute: "/train/go",
    };
  }

  if (normalizedAsin === normalizeAsin(env.proAsin)) {
    return {
      productType: "pro",
      productName: "Voice Flex Pro",
      trainingRoute: "/train/pro",
    };
  }

  return null;
}

export function getServerEnvironment(): ServerEnvironment | null {
  const supabaseUrl = process.env.VOICEFLEX_DB_URL;
  const serviceRoleKey = process.env.VOICEFLEX_SERVICE_ROLE_KEY;
  const goAsin = normalizeAsin(process.env.VOICE_FLEX_GO_ASIN);
  const proAsin = normalizeAsin(process.env.VOICE_FLEX_PRO_ASIN);

  if (!supabaseUrl || !serviceRoleKey || !goAsin || !proAsin) {
    return null;
  }

  return {
    supabaseUrl,
    serviceRoleKey,
    goAsin,
    proAsin,
  };
}

export function createVoiceFlexAdminClient(env: ServerEnvironment) {
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const PROGRESS_COLUMNS =
  "id, order_access_id, product_type, current_day, onboarding_completed, practice_streak, total_seconds, exercises_completed_count, full_sessions_completed, last_practice_date, profile_slot, profile_name, settings, created_at, updated_at";

export async function ensureOrderProgress(
  supabase: SupabaseClient,
  orderAccessId: string,
  productType: VoiceFlexProduct,
  profileSlot = 1,
  profileName: string | null = null,
): Promise<OrderProgressRow> {
  const selectRow = () =>
    supabase
      .from("voiceflex_order_progress")
      .select(PROGRESS_COLUMNS)
      .eq("order_access_id", orderAccessId)
      .eq("product_type", productType)
      .eq("profile_slot", profileSlot)
      .maybeSingle<OrderProgressRow>();

  const { data: existing, error: selectError } = await selectRow();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    if (profileName && !existing.profile_name) {
      const { error: nameError } = await supabase
        .from("voiceflex_order_progress")
        .update({ profile_name: profileName, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (nameError) throw nameError;
      return { ...existing, profile_name: profileName };
    }
    return existing;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("voiceflex_order_progress")
    .insert({
      order_access_id: orderAccessId,
      product_type: productType,
      profile_slot: profileSlot,
      profile_name: profileName,
      current_day: 1,
      onboarding_completed: false,
      practice_streak: 0,
      total_seconds: 0,
      exercises_completed_count: 0,
      full_sessions_completed: 0,
      last_practice_date: null,
    })
    .select(PROGRESS_COLUMNS)
    .single<OrderProgressRow>();

  if (insertError) {
    // Two devices creating the same profile at once: use the row the other one made.
    if (insertError.code === "23505") {
      const { data: raced, error: racedError } = await selectRow();
      if (racedError) throw racedError;
      if (raced) return raced;
    }
    throw insertError;
  }

  return inserted;
}

export type OrderProfileSummary = {
  slot: number;
  name: string | null;
  lastPracticeDate: string | null;
  totalMinutes: number;
  routinesCompleted: number;
};

export async function listOrderProfiles(
  supabase: SupabaseClient,
  orderAccessId: string,
  productType: VoiceFlexProduct,
): Promise<OrderProfileSummary[]> {
  const { data, error } = await supabase
    .from("voiceflex_order_progress")
    .select("profile_slot, profile_name, last_practice_date, total_seconds, full_sessions_completed")
    .eq("order_access_id", orderAccessId)
    .eq("product_type", productType)
    .order("profile_slot", { ascending: true });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    slot: Number(row.profile_slot ?? 1),
    name: row.profile_name ?? null,
    lastPracticeDate: row.last_practice_date ?? null,
    totalMinutes: Math.round(Number(row.total_seconds ?? 0) / 60),
    routinesCompleted: Number(row.full_sessions_completed ?? 0),
  }));
}

/** Recount a profile's totals from its daily activity rows. */
export async function recomputeProgressTotals(supabase: SupabaseClient, progress: OrderProgressRow) {
  const { data: rows, error } = await supabase
    .from("voiceflex_daily_activity")
    .select("activity_date, completed_exercise_ids, seconds_practiced, full_session_completed")
    .eq("order_access_id", progress.order_access_id)
    .eq("product_type", progress.product_type)
    .eq("profile_slot", progress.profile_slot ?? 1)
    .returns<Pick<DailyActivityRow, "activity_date" | "completed_exercise_ids" | "seconds_practiced" | "full_session_completed">[]>();

  if (error) throw error;

  const active = (rows ?? []).filter((row) => (row.seconds_practiced ?? 0) > 0 || (row.completed_exercise_ids ?? []).length > 0);
  const dates = active.map((row) => row.activity_date).sort();
  const totals = {
    practice_streak: calculatePracticeStreak(dates),
    total_seconds: (rows ?? []).reduce((sum, row) => sum + (row.seconds_practiced ?? 0), 0),
    exercises_completed_count: (rows ?? []).reduce((sum, row) => sum + (row.completed_exercise_ids ?? []).length, 0),
    full_sessions_completed: (rows ?? []).filter((row) => row.full_session_completed).length,
    last_practice_date: dates.length ? dates[dates.length - 1] : null,
  };

  const { error: updateError } = await supabase
    .from("voiceflex_order_progress")
    .update({ ...totals, updated_at: new Date().toISOString() })
    .eq("id", progress.id);

  if (updateError) throw updateError;
  return { ...progress, ...totals };
}

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateLabel(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function dateToUtcDay(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function calculatePracticeStreak(activityDates: string[]) {
  const days = Array.from(new Set(activityDates)).sort((a, b) => dateToUtcDay(b) - dateToUtcDay(a));
  if (!days.length) return 0;

  let streak = 1;
  let previous = dateToUtcDay(days[0]);

  for (const day of days.slice(1)) {
    const current = dateToUtcDay(day);
    if (previous - current !== 1) break;
    streak += 1;
    previous = current;
  }

  return streak;
}

export function calculateNextPracticeStreak(
  lastPracticeDate: string | null,
  currentPracticeStreak: number | null,
  today: string,
) {
  if (!lastPracticeDate) {
    return 1;
  }

  if (lastPracticeDate === today) {
    return currentPracticeStreak ?? 1;
  }

  const previousDay = dateToUtcDay(lastPracticeDate);
  const todayDay = dateToUtcDay(today);

  if (todayDay - previousDay === 1) {
    return (currentPracticeStreak ?? 0) + 1;
  }

  return 1;
}

export function secondsToMinutes(seconds: number) {
  return Math.round((seconds / 60) * 10) / 10;
}

export function secondsToClock(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export async function resolveVerifiedOrder(
  supabase: SupabaseClient,
  env: ServerEnvironment,
  orderNumber: string,
  expectedProductType?: VoiceFlexProduct,
) {
  const { data, error } = await supabase
    .from("amazon_order_access")
    .select("id, amazon_order_number, asin, source_asin, shipped, products")
    .eq("amazon_order_number", normalizeOrderNumber(orderNumber))
    .maybeSingle<AmazonOrderAccessRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      ok: false,
      status: "not_found",
      message:
        "We couldn't verify this order yet. If you purchased recently, please wait up to 24 hours for your training access to update, then try again.",
    } as const;
  }

  if (!data.shipped) {
    return {
      ok: false,
      status: "not_active",
      message: "We found your order, but your training access is not active yet. Please try again later.",
    } as const;
  }

  const normalizedAsin = normalizeAsin(data.asin);
  const primary = getProductMatch(normalizedAsin, env);
  const products = primary ? getOrderProducts(data, primary) : [];
  // An order can hold two products (e.g. Pro + GO): the caller picks one, otherwise the main one.
  const chosen = products.find((entry) => entry.productType === (expectedProductType ?? primary?.productType));

  if (!primary || !chosen) {
    return {
      ok: false,
      status: "unsupported_product",
      message: "We found your order, but couldn't match it to a Voice Flex kit. Please send us a message from your order page on Amazon.",
    } as const;
  }

  const sourceAsin = chosen.sourceAsin || normalizeAsin(data.source_asin) || normalizedAsin;

  return {
    ok: true,
    order: data,
    asin: normalizedAsin,
    sourceAsin,
    kit: getKitForOrder(chosen.productType, sourceAsin),
    product: productMatchFor(chosen.productType),
    products,
    /** How many people can each have their own profile for this product. */
    seats: chosen.units,
  } as const;
}
