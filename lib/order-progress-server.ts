import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { VoiceFlexProduct } from "@/lib/training-product";

export type ProductMatch = {
  productType: VoiceFlexProduct;
  productName: "Voice Flex GO" | "Voice Flex Pro";
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
  shipped: boolean | null;
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
  created_at?: string | null;
  updated_at?: string | null;
};

export const SERVER_ERROR_RESPONSE = {
  ok: false,
  status: "server_error",
  message: "We couldn’t verify your order right now. Please try again later.",
} as const;

export function normalizeAsin(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

export function getProductMatch(
  asin: string,
  env: Pick<ServerEnvironment, "goAsin" | "proAsin">,
): ProductMatch | null {
  if (asin === env.goAsin) {
    return {
      productType: "go",
      productName: "Voice Flex GO",
      trainingRoute: "/train/go",
    };
  }

  if (asin === env.proAsin) {
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

export async function ensureOrderProgress(
  supabase: SupabaseClient,
  orderAccessId: string,
  productType: VoiceFlexProduct,
) {
  const { data: existing, error: selectError } = await supabase
    .from("voiceflex_order_progress")
    .select(
      "id, order_access_id, product_type, current_day, onboarding_completed, practice_streak, total_seconds, exercises_completed_count, full_sessions_completed, last_practice_date, created_at, updated_at",
    )
    .eq("order_access_id", orderAccessId)
    .eq("product_type", productType)
    .maybeSingle<OrderProgressRow>();

  if (selectError) {
    throw selectError;
  }

  if (existing) {
    return existing;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("voiceflex_order_progress")
    .insert({
      order_access_id: orderAccessId,
      product_type: productType,
      current_day: 1,
      onboarding_completed: false,
      practice_streak: 0,
      total_seconds: 0,
      exercises_completed_count: 0,
      full_sessions_completed: 0,
      last_practice_date: null,
    })
    .select(
      "id, order_access_id, product_type, current_day, onboarding_completed, practice_streak, total_seconds, exercises_completed_count, full_sessions_completed, last_practice_date, created_at, updated_at",
    )
    .single<OrderProgressRow>();

  if (insertError) {
    throw insertError;
  }

  return inserted;
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
    .select("id, amazon_order_number, asin, shipped")
    .eq("amazon_order_number", orderNumber)
    .maybeSingle<AmazonOrderAccessRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return {
      ok: false,
      status: "not_found",
      message:
        "We couldn’t verify this order yet. If you purchased recently, please wait up to 24 hours for your training access to update, then try again.",
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
  const product = getProductMatch(normalizedAsin, env);

  if (!product || (expectedProductType && product.productType !== expectedProductType)) {
    return {
      ok: false,
      status: "unsupported_product",
      message: "We found your order, but we couldn’t match it to a Voice Flex training path. Please contact support.",
    } as const;
  }

  return {
    ok: true,
    order: data,
    asin: normalizedAsin,
    product,
  } as const;
}
