import { NextResponse } from "next/server";

import { getExercise } from "@/lib/exercises";
import { buildMilestoneStateFromActivity } from "@/lib/local-milestones";
import {
  createVoiceFlexAdminClient,
  type DailyActivityRow,
  ensureOrderProgress,
  getLocalDateString,
  getServerEnvironment,
  type OrderProgressRow,
  PROFILE_NOT_FOUND,
  recomputeProgressTotals,
  requestProfileSlot,
  resolveVerifiedOrder,
} from "@/lib/order-progress-server";
import { getRoutineBySlot, isRoutineSlot } from "@/lib/routines";
import { getTrainingSessionConfig } from "@/lib/training-sessions";
import { isVoiceFlexProduct } from "@/lib/training-product";

export const runtime = "nodejs";

/**
 * Keeps a person's training history in the database so it follows them to any device.
 * The device sends what it has (completed exercises, onboarding, settings); the server adds anything
 * it was missing, merges settings (newest change wins) and returns the full picture.
 */

/** Settings that follow the user. Values are the raw strings the app keeps in browser storage. */
const SYNCED_SETTINGS = ["kit", "voiceRange", "bestHold", "review", "appSettings"] as const;
type SyncedSetting = (typeof SYNCED_SETTINGS)[number];
type SettingEntry = { v: string; at: string };

const MAX_VALUE_LENGTH = 2000;
const MAX_COMPLETION_KEYS = 200;
const RETURNED_COMPLETION_KEYS = 120;
const DAY_KEY = /^(\d{4}-\d{2}-\d{2})-(\d+)$/;

type SyncRequest = {
  orderNumber?: unknown;
  productType?: unknown;
  profileSlot?: unknown;
  today?: unknown;
  local?: {
    onboardingCompleted?: unknown;
    completions?: unknown;
    settings?: unknown;
    unlockedMilestones?: unknown;
  };
};

const ERROR_RESPONSE = {
  ok: false,
  status: "server_error",
  message: "We couldn't sync your progress right now. Your training on this device still works.",
} as const;

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function readSettingEntry(value: unknown): SettingEntry | null {
  if (!value || typeof value !== "object") return null;
  const entry = value as { v?: unknown; at?: unknown };
  if (typeof entry.v !== "string" || entry.v.length > MAX_VALUE_LENGTH || !isIsoDate(entry.at)) return null;
  // A clock far in the future would win every merge, so cap it at now.
  const at = Math.min(Date.parse(entry.at), Date.now());
  return { v: entry.v, at: new Date(at).toISOString() };
}

function readUnlocked(value: unknown) {
  const out: Record<string, string> = {};
  if (!value || typeof value !== "object") return out;
  for (const [id, item] of Object.entries(value as Record<string, unknown>).slice(0, 100)) {
    const at = item && typeof item === "object" ? (item as { unlockedAt?: unknown }).unlockedAt : item;
    if (/^[a-z0-9_]{1,40}$/.test(id) && isIsoDate(at)) out[id] = new Date(Math.min(Date.parse(at), Date.now())).toISOString();
  }
  return out;
}

function dayDiff(a: string, b: string) {
  return Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as SyncRequest;
    const orderNumber = typeof body.orderNumber === "string" ? body.orderNumber.trim() : "";
    const productType = isVoiceFlexProduct(body.productType) ? body.productType : null;
    const today = typeof body.today === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.today) ? body.today : getLocalDateString();
    const local = body.local && typeof body.local === "object" ? body.local : {};

    if (!orderNumber || !productType) {
      return NextResponse.json({ ok: false, status: "bad_request", message: "Missing order details." }, { status: 400 });
    }

    const env = getServerEnvironment();
    if (!env) {
      console.error("[progress/sync] Missing required server environment configuration.");
      return NextResponse.json(ERROR_RESPONSE, { status: 500 });
    }

    const supabase = createVoiceFlexAdminClient(env);
    const verified = await resolveVerifiedOrder(supabase, env, orderNumber, productType);
    if (!verified.ok) {
      return NextResponse.json(verified, { status: verified.status === "not_found" ? 404 : 403 });
    }

    const profileSlot = requestProfileSlot(body.profileSlot, verified.seats);
    if (!profileSlot) {
      return NextResponse.json(PROFILE_NOT_FOUND, { status: 403 });
    }

    let progress: OrderProgressRow = await ensureOrderProgress(supabase, verified.order.id, productType, profileSlot);
    const kit = verified.kit;

    // Length of each exercise inside each routine, for completions saved while offline.
    const routineCache = new Map<number, Map<string, number>>();
    const routineSteps = (slot: number) => {
      let steps = routineCache.get(slot);
      if (!steps) {
        const session = getTrainingSessionConfig(productType, kit, getRoutineBySlot(slot).id);
        steps = new Map(session.exercises.map((exercise) => [exercise.id, exercise.durationSeconds]));
        routineCache.set(slot, steps);
      }
      return steps;
    };
    const exerciseSeconds = (slot: number, exerciseId: string) => routineSteps(isRoutineSlot(slot) ? slot : 1).get(exerciseId) ?? 60;

    const loadRows = async () => {
      const { data, error } = await supabase
        .from("voiceflex_daily_activity")
        .select("id, activity_date, program_day, completed_exercise_ids, completed_exercise_titles, seconds_practiced, full_session_completed")
        .eq("order_access_id", verified.order.id)
        .eq("product_type", productType)
        .eq("profile_slot", profileSlot)
        .order("activity_date", { ascending: true })
        .returns<DailyActivityRow[]>();
      if (error) throw error;
      return data ?? [];
    };

    let rows = await loadRows();

    // 1. Completed exercises this device has that the database doesn't.
    const byKey = new Map(rows.map((row) => [`${row.activity_date}-${row.program_day ?? 1}`, row]));
    const localCompletions =
      local.completions && typeof local.completions === "object" && !Array.isArray(local.completions)
        ? Object.entries(local.completions as Record<string, unknown>).slice(0, MAX_COMPLETION_KEYS)
        : [];
    let addedCompletions = 0;

    for (const [key, value] of localCompletions) {
      const match = DAY_KEY.exec(key);
      if (!match || !Array.isArray(value)) continue;
      const [, date, slotText] = match;
      const slot = Number(slotText);
      const age = dayDiff(today, date);
      if (!isRoutineSlot(slot) || Number.isNaN(age) || age < -1 || age > 400) continue;

      const ids = Array.from(new Set(value.filter((id): id is string => typeof id === "string" && Boolean(getExercise(id))))).slice(0, 30);
      const existing = byKey.get(key);
      const known = new Set(existing?.completed_exercise_ids ?? []);
      const missing = ids.filter((id) => !known.has(id));
      if (!missing.length) continue;

      const nextIds = [...(existing?.completed_exercise_ids ?? []), ...missing];
      const nextTitles = Array.from(
        new Set([...(existing?.completed_exercise_titles ?? []), ...missing.map((id) => getExercise(id)?.title ?? id)]),
      );
      const nextSeconds = (existing?.seconds_practiced ?? 0) + missing.reduce((sum, id) => sum + exerciseSeconds(slot, id), 0);
      const fullSessionCompleted = nextIds.length >= routineSteps(slot).size;
      const last = missing[missing.length - 1];

      if (existing?.id) {
        const { error } = await supabase
          .from("voiceflex_daily_activity")
          .update({
            completed_exercise_ids: nextIds,
            completed_exercise_titles: nextTitles,
            seconds_practiced: nextSeconds,
            full_session_completed: fullSessionCompleted,
            last_exercise_id: last,
            last_exercise_title: getExercise(last)?.title ?? last,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("voiceflex_daily_activity").insert({
          order_access_id: verified.order.id,
          product_type: productType,
          profile_slot: profileSlot,
          activity_date: date,
          program_day: slot,
          completed_exercise_ids: nextIds,
          completed_exercise_titles: nextTitles,
          seconds_practiced: nextSeconds,
          full_session_completed: fullSessionCompleted,
          last_exercise_id: last,
          last_exercise_title: getExercise(last)?.title ?? last,
        });
        // Another device saved the same day at the same moment: it is picked up on the next sync.
        if (error && error.code !== "23505") throw error;
      }
      addedCompletions += missing.length;
    }

    if (addedCompletions) {
      progress = await recomputeProgressTotals(supabase, progress);
      rows = await loadRows();
    }

    // 2. Onboarding done on any device counts everywhere.
    const updates: Record<string, unknown> = {};
    const onboardingCompleted = Boolean(progress.onboarding_completed) || local.onboardingCompleted === true;
    if (onboardingCompleted && !progress.onboarding_completed) updates.onboarding_completed = true;

    // 3. Settings: per setting, the newest change wins.
    const serverSettings = (progress.settings && typeof progress.settings === "object" ? progress.settings : {}) as Record<string, unknown>;
    const localSettings = (local.settings && typeof local.settings === "object" ? local.settings : {}) as Record<string, unknown>;
    const mergedSettings: Partial<Record<SyncedSetting, SettingEntry>> = {};
    for (const key of SYNCED_SETTINGS) {
      const fromServer = readSettingEntry(serverSettings[key]);
      const fromDevice = readSettingEntry(localSettings[key]);
      const winner = !fromServer ? fromDevice : !fromDevice ? fromServer : Date.parse(fromDevice.at) > Date.parse(fromServer.at) ? fromDevice : fromServer;
      if (winner) mergedSettings[key] = winner;
    }

    // Milestone unlock dates: keep the earliest date each milestone was reached.
    const unlocked = readUnlocked(serverSettings.milestonesUnlocked);
    for (const [id, at] of Object.entries(readUnlocked(local.unlockedMilestones))) {
      if (!unlocked[id] || Date.parse(at) < Date.parse(unlocked[id])) unlocked[id] = at;
    }

    const nextSettings = { ...mergedSettings, milestonesUnlocked: unlocked };
    if (JSON.stringify(nextSettings) !== JSON.stringify({ ...serverSettings })) updates.settings = nextSettings;

    if (Object.keys(updates).length) {
      const { error } = await supabase
        .from("voiceflex_order_progress")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", progress.id);
      if (error) throw error;
    }

    const completions = Object.fromEntries(
      rows
        .filter((row) => (row.completed_exercise_ids ?? []).length > 0)
        .map((row) => [`${row.activity_date}-${row.program_day ?? 1}`, Array.from(new Set(row.completed_exercise_ids ?? []))] as const)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, RETURNED_COMPLETION_KEYS),
    );

    const milestoneState = buildMilestoneStateFromActivity(
      productType,
      rows,
      exerciseSeconds,
      Object.fromEntries(Object.entries(unlocked).map(([id, at]) => [id, { unlockedAt: at }])),
    );

    return NextResponse.json({
      ok: true,
      status: "synced",
      profile: { slot: profileSlot, name: progress.profile_name ?? null, seats: verified.seats },
      onboardingCompleted,
      completions,
      settings: mergedSettings,
      unlockedMilestones: milestoneState.unlockedMilestones,
      milestoneState,
      stats: {
        totalSeconds: progress.total_seconds ?? 0,
        practiceStreak: progress.practice_streak ?? 0,
        lastPracticeDate: progress.last_practice_date ?? null,
      },
      addedCompletions,
    });
  } catch (error) {
    console.error("[progress/sync] Failed to sync progress.", error);
    return NextResponse.json(ERROR_RESPONSE, { status: 500 });
  }
}
