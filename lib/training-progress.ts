import { ACTIVE_PRODUCT_KEY, isVoiceFlexProduct, type VoiceFlexProduct } from "@/lib/training-product";

export const TRAINING_PROGRESS_KEYS: Record<VoiceFlexProduct, string> = {
  pro: "voiceflex_progress_pro",
  go: "voiceflex_progress_go"
};

export interface LocalTrainingProgress {
  productType: VoiceFlexProduct;
  activeProgram: string;
  onboardingCompleted: boolean;
  currentDay: number;
  completedDays: number[];
  completedExercises: Record<string, string[]>;
  totalMinutes: number;
  streak: number;
  lastCompletedAt: string | null;
  startedAt: string;
  updatedAt: string;
}

export type TrainingProgress = LocalTrainingProgress;

export interface TrainingProgressStore {
  getProgress(productType: VoiceFlexProduct): TrainingProgress | null;
  saveProgress(productType: VoiceFlexProduct, progress: TrainingProgress): TrainingProgress;
  initializeProgress(productType: VoiceFlexProduct): TrainingProgress;
  getOrCreateProgress(productType: VoiceFlexProduct): TrainingProgress;
  updateProgress(productType: VoiceFlexProduct, partialUpdate: Partial<TrainingProgress>): TrainingProgress;
  markOnboardingCompleted(productType: VoiceFlexProduct): TrainingProgress;
  resetProgress(productType: VoiceFlexProduct): TrainingProgress;
  resetAllTrainingProgress(): void;
  markExerciseCompleted(productType: VoiceFlexProduct, dayKey: string, exerciseId: string): TrainingProgress;
  addTrainingMinutes(productType: VoiceFlexProduct, minutes: number): TrainingProgress;
  updateTrainingStreakForToday(productType: VoiceFlexProduct, date?: Date): TrainingProgress;
}

export function getProgressKey(productType: VoiceFlexProduct) {
  return TRAINING_PROGRESS_KEYS[productType];
}

export function getDefaultTrainingProgress(productType: VoiceFlexProduct, now = new Date()): LocalTrainingProgress {
  const timestamp = now.toISOString();

  return {
    productType,
    activeProgram: productType === "pro" ? "voiceflex_pro_21_day" : "voiceflex_go_21_day",
    onboardingCompleted: false,
    currentDay: 1,
    completedDays: [],
    completedExercises: {},
    totalMinutes: 0,
    streak: 0,
    lastCompletedAt: null,
    startedAt: timestamp,
    updatedAt: timestamp
  };
}

function safeParseProgress(value: string | null, productType: VoiceFlexProduct): LocalTrainingProgress | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<LocalTrainingProgress>;
    const fallback = getDefaultTrainingProgress(productType);

    return {
      ...fallback,
      ...parsed,
      productType,
      activeProgram: typeof parsed.activeProgram === "string" ? parsed.activeProgram : fallback.activeProgram,
      onboardingCompleted: Boolean(parsed.onboardingCompleted),
      currentDay: Number.isFinite(parsed.currentDay) && parsed.currentDay ? Number(parsed.currentDay) : fallback.currentDay,
      completedDays: Array.isArray(parsed.completedDays) ? parsed.completedDays.filter((day) => Number.isFinite(day)) : [],
      completedExercises:
        parsed.completedExercises && typeof parsed.completedExercises === "object" && !Array.isArray(parsed.completedExercises)
          ? Object.fromEntries(
              Object.entries(parsed.completedExercises).map(([dayKey, ids]) => [
                dayKey,
                Array.isArray(ids) ? Array.from(new Set(ids.filter((id): id is string => typeof id === "string"))) : []
              ])
            )
          : {},
      totalMinutes: Number.isFinite(parsed.totalMinutes) ? Number(parsed.totalMinutes) : 0,
      streak: Number.isFinite(parsed.streak) ? Number(parsed.streak) : 0,
      lastCompletedAt: typeof parsed.lastCompletedAt === "string" ? parsed.lastCompletedAt : null,
      startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : fallback.startedAt,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : fallback.updatedAt
    };
  } catch {
    return null;
  }
}

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getYesterdayLocalDateString(date = new Date()) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return getLocalDateString(previous);
}

export function getProgress(productType: VoiceFlexProduct): LocalTrainingProgress {
  if (!hasLocalStorage()) return getDefaultTrainingProgress(productType);
  return safeParseProgress(window.localStorage.getItem(getProgressKey(productType)), productType) ?? getDefaultTrainingProgress(productType);
}

export function saveProgress(productType: VoiceFlexProduct, progress: LocalTrainingProgress): LocalTrainingProgress {
  const nextProgress: LocalTrainingProgress = {
    ...progress,
    productType,
    updatedAt: new Date().toISOString()
  };

  if (hasLocalStorage()) {
    window.localStorage.setItem(getProgressKey(productType), JSON.stringify(nextProgress));
  }

  return nextProgress;
}

export function initializeProgress(productType: VoiceFlexProduct): LocalTrainingProgress {
  if (!hasLocalStorage()) return getDefaultTrainingProgress(productType);

  const existing = safeParseProgress(window.localStorage.getItem(getProgressKey(productType)), productType);
  if (existing) return existing;

  const progress = getDefaultTrainingProgress(productType);
  window.localStorage.setItem(getProgressKey(productType), JSON.stringify(progress));
  return progress;
}

export function getOrCreateProgress(productType: VoiceFlexProduct): LocalTrainingProgress {
  return initializeProgress(productType);
}

export function updateProgress(productType: VoiceFlexProduct, partialUpdate: Partial<LocalTrainingProgress>): LocalTrainingProgress {
  const current = getOrCreateProgress(productType);
  return saveProgress(productType, {
    ...current,
    ...partialUpdate,
    productType
  });
}

export function markOnboardingCompleted(productType: VoiceFlexProduct): LocalTrainingProgress {
  return updateProgress(productType, { onboardingCompleted: true });
}

export function resetProgress(productType: VoiceFlexProduct): LocalTrainingProgress {
  const progress = getDefaultTrainingProgress(productType);
  if (hasLocalStorage()) {
    window.localStorage.setItem(getProgressKey(productType), JSON.stringify(progress));
  }
  return progress;
}

export function resetAllTrainingProgress() {
  if (!hasLocalStorage()) return;
  window.localStorage.removeItem(TRAINING_PROGRESS_KEYS.pro);
  window.localStorage.removeItem(TRAINING_PROGRESS_KEYS.go);
}

export function markExerciseCompleted(productType: VoiceFlexProduct, dayKey: string, exerciseId: string): LocalTrainingProgress {
  const current = getOrCreateProgress(productType);
  const existingIds = current.completedExercises[dayKey] ?? [];
  const completedExercises = {
    ...current.completedExercises,
    [dayKey]: Array.from(new Set([...existingIds, exerciseId]))
  };

  return saveProgress(productType, {
    ...current,
    completedExercises
  });
}

export function addTrainingMinutes(productType: VoiceFlexProduct, minutes: number): LocalTrainingProgress {
  const current = getOrCreateProgress(productType);
  const safeMinutes = Number.isFinite(minutes) ? Math.max(0, minutes) : 0;

  return saveProgress(productType, {
    ...current,
    totalMinutes: Math.round((current.totalMinutes + safeMinutes) * 10) / 10
  });
}

export function updateTrainingStreakForToday(productType: VoiceFlexProduct, date = new Date()): LocalTrainingProgress {
  const current = getOrCreateProgress(productType);
  const today = getLocalDateString(date);
  const yesterday = getYesterdayLocalDateString(date);

  if (current.lastCompletedAt === today) return current;

  const nextStreak = current.lastCompletedAt === yesterday ? current.streak + 1 : 1;
  return saveProgress(productType, {
    ...current,
    streak: nextStreak,
    lastCompletedAt: today
  });
}

export function getStoredActiveProduct(): VoiceFlexProduct | null {
  if (!hasLocalStorage()) return null;
  const value = window.localStorage.getItem(ACTIVE_PRODUCT_KEY);
  return isVoiceFlexProduct(value) ? value : null;
}

export const localStorageTrainingProgressStore: TrainingProgressStore = {
  getProgress,
  saveProgress,
  initializeProgress,
  getOrCreateProgress,
  updateProgress,
  markOnboardingCompleted,
  resetProgress,
  resetAllTrainingProgress,
  markExerciseCompleted,
  addTrainingMinutes,
  updateTrainingStreakForToday
};

// Future: replace or wrap this adapter with a Supabase-backed store after
// order-number access is implemented.
export function getTrainingProgressStore(): TrainingProgressStore {
  return localStorageTrainingProgressStore;
}

export const trainingProgressStore = getTrainingProgressStore();
