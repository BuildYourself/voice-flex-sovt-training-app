import {
  getMilestoneOrderAccessId,
  loadLocalMilestones,
  saveLocalMilestones,
  type LocalMilestoneState,
} from "@/lib/local-milestones";
import { getIdentityRequestFields, updateProfileName } from "@/lib/training-identity";
import { getProgress, saveProgress } from "@/lib/training-progress";
import type { VoiceFlexProduct } from "@/lib/training-product";

/**
 * Keeps this device and the person's account in step: completed exercises, onboarding, milestones and
 * settings live in the database, so a new phone or laptop picks up exactly where they left off.
 * The training pages keep reading browser storage as before; this fills it from the account.
 */

/** Settings that follow the user, with where each one lives in browser storage. */
const SYNCED_SETTINGS: { id: string; storageKey: (productType: VoiceFlexProduct) => string }[] = [
  { id: "kit", storageKey: (productType) => `voiceflex_kit_${productType}` },
  { id: "voiceRange", storageKey: () => "voiceflex_voice_range" },
  { id: "bestHold", storageKey: (productType) => `voiceflex_best_hold_${productType}` },
  { id: "review", storageKey: (productType) => `voiceflex_review_request_${productType}` },
  { id: "appSettings", storageKey: () => "voiceflex_settings" },
];

type SettingEntry = { v: string; at: string };
/** Per setting: the value last synced and when it last changed, so only real changes win a merge. */
type SyncMeta = Record<string, { h: string; at: string }>;

type SyncResponse = {
  ok?: boolean;
  status?: string;
  profile?: { slot: number; name: string | null; seats: number };
  onboardingCompleted?: boolean;
  completions?: Record<string, string[]>;
  settings?: Record<string, SettingEntry>;
  milestoneState?: LocalMilestoneState;
  stats?: { totalSeconds: number; practiceStreak: number; lastPracticeDate: string | null };
};

const DATED_KEY = /^\d{4}-\d{2}-\d{2}-\d+$/;
const MAX_DAY_KEYS = 120;
const RECENT_SYNC_MS = 60_000;

function metaKey(productType: VoiceFlexProduct) {
  return `voiceflex_sync_meta_${productType}`;
}

function syncedAtKey(productType: VoiceFlexProduct) {
  return `voiceflex_synced_at_${productType}`;
}

function readMeta(productType: VoiceFlexProduct): SyncMeta {
  try {
    const raw = window.localStorage.getItem(metaKey(productType));
    return raw ? (JSON.parse(raw) as SyncMeta) : {};
  } catch {
    return {};
  }
}

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function wasSyncedRecently(productType: VoiceFlexProduct) {
  if (typeof window === "undefined") return false;
  try {
    const at = Number(window.sessionStorage.getItem(syncedAtKey(productType)));
    return Number.isFinite(at) && Date.now() - at < RECENT_SYNC_MS;
  } catch {
    return false;
  }
}

const running = new Map<VoiceFlexProduct, Promise<boolean>>();
const rerun = new Set<VoiceFlexProduct>();

/**
 * Sync one product's progress with the account. Resolves false when offline or not verified.
 * A request made while a sync is running is not dropped: one more sync runs right after it.
 */
export function syncTrainingProgress(productType: VoiceFlexProduct, { timeoutMs = 4000 } = {}): Promise<boolean> {
  const current = running.get(productType);
  if (current) {
    rerun.add(productType);
    return current;
  }
  const job = runSync(productType, timeoutMs).finally(() => {
    running.delete(productType);
    if (rerun.delete(productType)) void syncTrainingProgress(productType, { timeoutMs });
  });
  running.set(productType, job);
  return job;
}

async function runSync(productType: VoiceFlexProduct, timeoutMs: number): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const identity = getIdentityRequestFields(productType);
  if (!identity) return false;

  const progress = getProgress(productType);
  const milestones = loadLocalMilestones(productType);
  const meta = readMeta(productType);
  const now = new Date().toISOString();

  const settings: Record<string, SettingEntry> = {};
  /** What each setting held when the request was sent, to spot changes made while it is in flight. */
  const sent: Record<string, string | null> = {};
  for (const setting of SYNCED_SETTINGS) {
    const value = window.localStorage.getItem(setting.storageKey(productType));
    sent[setting.id] = value;
    if (value === null) continue;
    const previous = meta[setting.id];
    settings[setting.id] = { v: value, at: previous && previous.h === value ? previous.at : now };
  }

  const completions = Object.fromEntries(
    Object.entries(progress.completedExercises).filter(([key, ids]) => DATED_KEY.test(key) && ids.length),
  );

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  let payload: SyncResponse | null = null;

  try {
    const response = await fetch("/api/progress/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        ...identity,
        productType,
        today: localDateString(),
        local: {
          onboardingCompleted: progress.onboardingCompleted,
          completions,
          settings,
          unlockedMilestones: milestones.unlockedMilestones,
        },
      }),
    });
    payload = (await response.json().catch(() => null)) as SyncResponse | null;
    if (!response.ok || !payload?.ok) return false;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }

  try {
    applyServerState(productType, payload, sent, meta);
    window.sessionStorage.setItem(syncedAtKey(productType), String(Date.now()));
  } catch (error) {
    console.warn("[cloud-sync] Could not apply synced progress.", error);
    return false;
  }
  return true;
}

function applyServerState(
  productType: VoiceFlexProduct,
  payload: SyncResponse,
  sent: Record<string, string | null>,
  previousMeta: SyncMeta,
) {
  // Settings: write what the account has, and remember it as synced.
  const nextMeta: SyncMeta = {};
  for (const setting of SYNCED_SETTINGS) {
    const key = setting.storageKey(productType);
    const now = window.localStorage.getItem(key);
    // Changed on this device while the sync was running: keep it, the next sync saves it.
    if (now !== sent[setting.id]) {
      if (previousMeta[setting.id]) nextMeta[setting.id] = previousMeta[setting.id];
      continue;
    }
    const entry = payload.settings?.[setting.id];
    if (!entry || typeof entry.v !== "string") continue;
    if (now !== entry.v) window.localStorage.setItem(key, entry.v);
    nextMeta[setting.id] = { h: entry.v, at: entry.at };
  }
  window.localStorage.setItem(metaKey(productType), JSON.stringify(nextMeta));

  // Progress: completed exercises from every device, onboarding, totals.
  const current = getProgress(productType);
  const merged: Record<string, string[]> = { ...current.completedExercises };
  for (const [key, ids] of Object.entries(payload.completions ?? {})) {
    merged[key] = Array.from(new Set([...(merged[key] ?? []), ...ids]));
  }
  const completedExercises = Object.fromEntries(
    Object.entries(merged)
      .filter(([key]) => DATED_KEY.test(key))
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, MAX_DAY_KEYS),
  );
  saveProgress(productType, {
    ...current,
    completedExercises,
    onboardingCompleted: Boolean(payload.onboardingCompleted) || current.onboardingCompleted,
    totalMinutes: payload.stats ? Math.round((payload.stats.totalSeconds / 60) * 10) / 10 : current.totalMinutes,
    streak: payload.stats?.practiceStreak ?? current.streak,
    lastCompletedAt: payload.stats?.lastPracticeDate ?? current.lastCompletedAt,
  });

  // Milestones: rebuilt on the server from the saved history.
  if (payload.milestoneState) {
    const orderAccessId = getMilestoneOrderAccessId();
    const local = loadLocalMilestones(productType, orderAccessId);
    saveLocalMilestones(productType, orderAccessId, {
      ...payload.milestoneState,
      completedEventKeys: local.completedEventKeys,
      createdAt: local.createdAt,
    });
  }

  updateProfileName(productType, payload.profile?.name ?? null);
}
