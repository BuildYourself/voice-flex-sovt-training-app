import { getExercise } from "@/lib/exercises";
import type { VoiceFlexProduct } from "@/lib/training-product";

export type MilestoneCategory = "starter" | "consistency" | "time" | "sessions" | "skills";
export type MilestoneStatus = "completed" | "in-progress" | "locked" | "not-started";

export type LocalMilestoneState = {
  version: 1;
  productType: VoiceFlexProduct;
  orderAccessId?: string;
  totals: {
    totalSeconds: number;
    exercisesCompleted: number;
    fullSessionsCompleted: number;
    practiceDays: string[];
    currentStreak: number;
    lastPracticeDate: string | null;
  };
  exerciseStats: {
    waves: number;
    siren: number;
    twoNotes: number;
    arpeggio: number;
    fiveNotes: number;
    voiceCheck: number;
    other: number;
  };
  focusStats: {
    breathSeconds: number;
    flexibilityCount: number;
    pitchExerciseCount: number;
    speakingCount: number;
    consistencyDays: number;
  };
  completedEventKeys: string[];
  unlockedMilestones: Record<string, { unlockedAt: string }>;
  createdAt: string;
  updatedAt: string;
};

export type LocalExerciseCompletionEvent = {
  productType: VoiceFlexProduct;
  orderAccessId?: string;
  exerciseId: string;
  exerciseTitle: string;
  durationSeconds: number;
  programDay?: number;
  completedAt: string;
  sessionRunId: string;
};

export type LocalFullSessionCompletionEvent = {
  productType: VoiceFlexProduct;
  orderAccessId?: string;
  completedAt: string;
  sessionRunId: string;
};

export type ComputedMilestone = {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  target: number;
  value: number;
  status: MilestoneStatus;
  progressPercent: number;
};

type MilestoneDefinition = {
  id: string;
  title: string;
  description: string;
  category: MilestoneCategory;
  target: number;
  getValue: (state: LocalMilestoneState) => number;
  lockedUntil?: string[];
};

export const MILESTONE_STORAGE_PREFIX = "voiceflex:milestones:v1";

const MILESTONES: MilestoneDefinition[] = [
  { id: "first_step", title: "First Step", description: "Complete your first exercise.", category: "starter", target: 1, getValue: (state) => state.totals.exercisesCompleted },
  { id: "first_full_session", title: "First Full Routine", description: "Finish every step of a routine.", category: "starter", target: 1, getValue: (state) => state.totals.fullSessionsCompleted },
  { id: "ten_minutes", title: "10 Minutes Trained", description: "Train for a total of 10 minutes.", category: "time", target: 600, getValue: (state) => state.totals.totalSeconds },
  { id: "thirty_minutes", title: "30 Minutes Trained", description: "Train for a total of 30 minutes.", category: "time", target: 1800, getValue: (state) => state.totals.totalSeconds },
  { id: "one_hour", title: "1 Hour Trained", description: "Train for a total of 1 hour.", category: "time", target: 3600, getValue: (state) => state.totals.totalSeconds, lockedUntil: ["thirty_minutes"] },
  { id: "three_day_streak", title: "3-Day Streak", description: "Practice on 3 consecutive days.", category: "consistency", target: 3, getValue: (state) => state.totals.currentStreak },
  { id: "seven_day_routine", title: "7-Day Routine", description: "Practice on 7 consecutive days.", category: "consistency", target: 7, getValue: (state) => state.totals.currentStreak, lockedUntil: ["three_day_streak"] },
  { id: "two_full_sessions", title: "2 Full Routines", description: "Finish 2 routines.", category: "sessions", target: 2, getValue: (state) => state.totals.fullSessionsCompleted, lockedUntil: ["first_full_session"] },
  { id: "five_full_sessions", title: "5 Full Routines", description: "Finish 5 routines.", category: "sessions", target: 5, getValue: (state) => state.totals.fullSessionsCompleted, lockedUntil: ["two_full_sessions"] },
  { id: "smooth_starter", title: "Smooth Starter", description: "Complete 5 Siren exercises.", category: "skills", target: 5, getValue: (state) => state.exerciseStats.siren },
  { id: "breath_builder", title: "Breath Builder", description: "Complete 10 Waves exercises.", category: "skills", target: 10, getValue: (state) => state.exerciseStats.waves },
  { id: "pitch_starter", title: "Pitch Starter", description: "Complete 5 pitch exercises.", category: "skills", target: 5, getValue: (state) => state.focusStats.pitchExerciseCount },
  { id: "voice_check_habit", title: "Voice Check Habit", description: "Complete 3 Voice Checks.", category: "skills", target: 3, getValue: (state) => state.exerciseStats.voiceCheck }
];

const LEVELS = [
  { level: 1, xp: 0, name: "Getting Started" },
  { level: 2, xp: 100, name: "Consistent Beginner" },
  { level: 3, xp: 220, name: "Routine Builder" },
  { level: 4, xp: 400, name: "Breath Builder" },
  { level: 5, xp: 650, name: "Flexible Voice" },
  { level: 6, xp: 950, name: "Pitch Explorer" },
  { level: 7, xp: 1300, name: "Voice Athlete" },
  { level: 8, xp: 1750, name: "Strong Routine" },
  { level: 9, xp: 2300, name: "Vocal Momentum" },
  { level: 10, xp: 3000, name: "VoiceFlex Champion" }
];

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function yesterdayDateString(date = new Date()) {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return localDateString(previous);
}

export function getMilestoneOrderAccessId() {
  if (!hasLocalStorage()) return undefined;
  return (
    window.localStorage.getItem("voiceflex_verified_order_number") ||
    window.localStorage.getItem("voiceflex_order_number") ||
    window.localStorage.getItem("voiceflex_order_access_id") ||
    undefined
  );
}

export function getMilestoneStorageKey(productType: VoiceFlexProduct, orderAccessId?: string) {
  return `${MILESTONE_STORAGE_PREFIX}:${productType}:${orderAccessId || "local"}`;
}

function defaultState(productType: VoiceFlexProduct, orderAccessId?: string): LocalMilestoneState {
  const timestamp = new Date().toISOString();
  return {
    version: 1,
    productType,
    orderAccessId,
    totals: {
      totalSeconds: 0,
      exercisesCompleted: 0,
      fullSessionsCompleted: 0,
      practiceDays: [],
      currentStreak: 0,
      lastPracticeDate: null
    },
    exerciseStats: {
      waves: 0,
      siren: 0,
      twoNotes: 0,
      arpeggio: 0,
      fiveNotes: 0,
      voiceCheck: 0,
      other: 0
    },
    focusStats: {
      breathSeconds: 0,
      flexibilityCount: 0,
      pitchExerciseCount: 0,
      speakingCount: 0,
      consistencyDays: 0
    },
    completedEventKeys: [],
    unlockedMilestones: {},
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function loadLocalMilestones(productType: VoiceFlexProduct, orderAccessId = getMilestoneOrderAccessId()) {
  if (!hasLocalStorage()) return defaultState(productType, orderAccessId);

  try {
    const raw = window.localStorage.getItem(getMilestoneStorageKey(productType, orderAccessId));
    if (!raw) return defaultState(productType, orderAccessId);
    const parsed = JSON.parse(raw) as LocalMilestoneState;
    return {
      ...defaultState(productType, orderAccessId),
      ...parsed,
      productType,
      orderAccessId,
      totals: { ...defaultState(productType, orderAccessId).totals, ...parsed.totals },
      exerciseStats: { ...defaultState(productType, orderAccessId).exerciseStats, ...parsed.exerciseStats },
      focusStats: { ...defaultState(productType, orderAccessId).focusStats, ...parsed.focusStats },
      completedEventKeys: Array.isArray(parsed.completedEventKeys) ? parsed.completedEventKeys : [],
      unlockedMilestones: parsed.unlockedMilestones || {}
    };
  } catch {
    return defaultState(productType, orderAccessId);
  }
}

export function saveLocalMilestones(productType: VoiceFlexProduct, orderAccessId: string | undefined, state: LocalMilestoneState) {
  const nextState = {
    ...state,
    productType,
    orderAccessId,
    updatedAt: new Date().toISOString()
  };

  if (hasLocalStorage()) {
    window.localStorage.setItem(getMilestoneStorageKey(productType, orderAccessId), JSON.stringify(nextState));
  }

  return nextState;
}

type ExerciseCategory = keyof LocalMilestoneState["exerciseStats"];

function getExerciseCategory(exerciseId: string, exerciseTitle: string): ExerciseCategory {
  const normalized = `${exerciseId} ${exerciseTitle}`.toLowerCase();
  if (normalized.includes("wave")) return "waves";
  if (normalized.includes("siren")) return "siren";
  if (normalized.includes("2 notes") || normalized.includes("two-notes") || normalized.includes("two notes")) return "twoNotes";
  if (normalized.includes("arpeggio")) return "arpeggio";
  if (normalized.includes("5 notes") || normalized.includes("five-notes") || normalized.includes("five notes")) return "fiveNotes";
  if (normalized.includes("voice check")) return "voiceCheck";
  return "other";
}

function updatePracticeDay(state: LocalMilestoneState, completedAt: string) {
  const today = localDateString(new Date(completedAt));
  const lastPracticeDate = state.totals.lastPracticeDate;
  const practiceDays = state.totals.practiceDays.includes(today) ? state.totals.practiceDays : [...state.totals.practiceDays, today];

  let currentStreak = state.totals.currentStreak;
  if (!lastPracticeDate) currentStreak = 1;
  else if (lastPracticeDate === today) currentStreak = state.totals.currentStreak || 1;
  else if (lastPracticeDate === yesterdayDateString(new Date(completedAt))) currentStreak = state.totals.currentStreak + 1;
  else currentStreak = 1;

  return {
    ...state.totals,
    practiceDays,
    currentStreak,
    consistencyDays: practiceDays.length,
    lastPracticeDate: today
  };
}

function withUnlockedMilestones(state: LocalMilestoneState) {
  const computed = computeMilestones(state);
  const now = new Date().toISOString();
  const unlockedMilestones = { ...state.unlockedMilestones };
  computed.forEach((milestone) => {
    if (milestone.status === "completed" && !unlockedMilestones[milestone.id]) {
      unlockedMilestones[milestone.id] = { unlockedAt: now };
    }
  });
  return { ...state, unlockedMilestones };
}

export function recordLocalExerciseCompletion(event: LocalExerciseCompletionEvent) {
  const orderAccessId = event.orderAccessId || getMilestoneOrderAccessId();
  const state = loadLocalMilestones(event.productType, orderAccessId);
  const eventKey = `exercise:${event.sessionRunId}:${event.exerciseId}`;
  if (state.completedEventKeys.includes(eventKey)) return state;

  const category = getExerciseCategory(event.exerciseId, event.exerciseTitle);
  const exerciseStats = { ...state.exerciseStats, [category]: state.exerciseStats[category] + 1 };
  const focusStats = { ...state.focusStats };

  // Skill bars follow the exercise library (lib/exercises.ts).
  const skills = getExercise(event.exerciseId)?.skills ?? [];
  if (skills.includes("breath")) focusStats.breathSeconds += event.durationSeconds;
  if (skills.includes("flexibility")) focusStats.flexibilityCount += 1;
  if (skills.includes("pitch")) focusStats.pitchExerciseCount += 1;
  if (skills.includes("speaking")) focusStats.speakingCount += 1;

  const totals = updatePracticeDay(
    {
      ...state,
      totals: {
        ...state.totals,
        totalSeconds: state.totals.totalSeconds + event.durationSeconds,
        exercisesCompleted: state.totals.exercisesCompleted + 1
      }
    },
    event.completedAt
  );

  const nextState = withUnlockedMilestones({
    ...state,
    totals: {
      ...totals,
      totalSeconds: state.totals.totalSeconds + event.durationSeconds,
      exercisesCompleted: state.totals.exercisesCompleted + 1
    },
    exerciseStats,
    focusStats: {
      ...focusStats,
      consistencyDays: totals.practiceDays.length
    },
    completedEventKeys: [eventKey, ...state.completedEventKeys].slice(0, 800)
  });

  return saveLocalMilestones(event.productType, orderAccessId, nextState);
}

export function recordLocalFullSessionCompletion(event: LocalFullSessionCompletionEvent) {
  const orderAccessId = event.orderAccessId || getMilestoneOrderAccessId();
  const state = loadLocalMilestones(event.productType, orderAccessId);
  const eventKey = `full-session:${event.sessionRunId}`;
  if (state.completedEventKeys.includes(eventKey)) return state;

  const nextState = withUnlockedMilestones({
    ...state,
    totals: {
      ...state.totals,
      fullSessionsCompleted: state.totals.fullSessionsCompleted + 1
    },
    completedEventKeys: [eventKey, ...state.completedEventKeys].slice(0, 800)
  });

  return saveLocalMilestones(event.productType, orderAccessId, nextState);
}

export function computeMilestones(state: LocalMilestoneState): ComputedMilestone[] {
  const values = new Map(MILESTONES.map((milestone) => [milestone.id, milestone.getValue(state)]));

  return MILESTONES.map((milestone) => {
    const value = values.get(milestone.id) ?? 0;
    const completed = value >= milestone.target;
    const locked = Boolean(milestone.lockedUntil?.some((id) => (values.get(id) ?? 0) < (MILESTONES.find((item) => item.id === id)?.target ?? 0)));
    const status: MilestoneStatus = completed ? "completed" : locked ? "locked" : value > 0 ? "in-progress" : "not-started";

    return {
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      category: milestone.category,
      target: milestone.target,
      value,
      status,
      progressPercent: Math.max(0, Math.min(100, Math.round((value / milestone.target) * 100)))
    };
  });
}

export function computeVoiceJourney(state: LocalMilestoneState) {
  const xp =
    Math.floor(state.totals.totalSeconds / 60) * 2 +
    state.totals.exercisesCompleted * 8 +
    state.totals.fullSessionsCompleted * 60 +
    state.totals.practiceDays.length * 15 +
    state.totals.currentStreak * 10;
  const current = LEVELS.reduce((best, level) => (xp >= level.xp ? level : best), LEVELS[0]);
  const next = LEVELS.find((level) => level.level === current.level + 1) ?? current;
  const progressToNextLevelPercent =
    current.level >= 10 ? 100 : Math.max(0, Math.min(100, Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100)));

  return {
    xp,
    level: current.level,
    levelName: current.name,
    currentLevelXp: current.xp,
    nextLevelXp: next.xp,
    nextLevel: next.level,
    progressToNextLevelPercent
  };
}

const TRAINING_BALANCE_LEVEL_NAMES = ["Foundation", "Builder", "Control", "Strength", "Mastery"] as const;

export function computeTrainingBalanceLevel(value: number, thresholds: number[], suffix: string) {
  const cappedLevelIndex = thresholds.findIndex((threshold) => value < threshold);
  const levelIndex = cappedLevelIndex === -1 ? thresholds.length - 1 : cappedLevelIndex;
  const level = levelIndex + 1;
  const levelName = TRAINING_BALANCE_LEVEL_NAMES[levelIndex] ?? TRAINING_BALANCE_LEVEL_NAMES[TRAINING_BALANCE_LEVEL_NAMES.length - 1];
  const targetValue = thresholds[levelIndex] ?? thresholds[thresholds.length - 1];
  const isMastered = value >= thresholds[thresholds.length - 1];
  const progressPercent = isMastered ? 100 : Math.max(0, Math.min(100, (value / targetValue) * 100));

  return {
    level,
    levelName,
    currentValue: value,
    targetValue,
    progressPercent,
    label: `Level ${level} · ${levelName}`,
    display: isMastered ? `${targetValue}+ ${suffix}` : `${value} / ${targetValue} ${suffix}`
  };
}

export function computeTrainingBalance(state: LocalMilestoneState) {
  const breathMinutes = Math.round((state.focusStats.breathSeconds / 60) * 10) / 10;
  const breath = computeTrainingBalanceLevel(breathMinutes, [10, 25, 50, 100, 200], "min");
  const flexibility = computeTrainingBalanceLevel(state.focusStats.flexibilityCount, [5, 15, 30, 60, 120], "glides");
  const pitch = computeTrainingBalanceLevel(state.focusStats.pitchExerciseCount, [10, 25, 50, 100, 200], "pitch exercises");
  const speaking = computeTrainingBalanceLevel(state.focusStats.speakingCount, [5, 15, 30, 60, 120], "speaking drills");
  const consistency = computeTrainingBalanceLevel(state.totals.practiceDays.length, [3, 7, 14, 30, 60], "practice days");

  return [
    { label: "Breath Control", value: breathMinutes, target: breath.targetValue, suffix: "min", display: breath.display, percent: breath.progressPercent, level: breath.level, levelName: breath.levelName, levelLabel: breath.label, tone: "blue" },
    { label: "Vocal Flexibility", value: state.focusStats.flexibilityCount, target: flexibility.targetValue, suffix: "glides", display: flexibility.display, percent: flexibility.progressPercent, level: flexibility.level, levelName: flexibility.levelName, levelLabel: flexibility.label, tone: "purple" },
    { label: "Pitch Stability", value: state.focusStats.pitchExerciseCount, target: pitch.targetValue, suffix: "pitch exercises", display: pitch.display, percent: pitch.progressPercent, level: pitch.level, levelName: pitch.levelName, levelLabel: pitch.label, tone: "violet" },
    { label: "Speaking Voice", value: state.focusStats.speakingCount, target: speaking.targetValue, suffix: "speaking drills", display: speaking.display, percent: speaking.progressPercent, level: speaking.level, levelName: speaking.levelName, levelLabel: speaking.label, tone: "green" },
    { label: "Consistency", value: state.totals.practiceDays.length, target: consistency.targetValue, suffix: "practice days", display: consistency.display, percent: consistency.progressPercent, level: consistency.level, levelName: consistency.levelName, levelLabel: consistency.label, tone: "orange" }
  ];
}

export function resetAllLocalMilestones() {
  if (!hasLocalStorage()) return;
  Object.keys(window.localStorage)
    .filter((key) => key.startsWith(MILESTONE_STORAGE_PREFIX))
    .forEach((key) => window.localStorage.removeItem(key));
}

export type MilestoneActivityRow = {
  activity_date: string;
  program_day: number | null;
  completed_exercise_ids: string[] | null;
  seconds_practiced: number | null;
  full_session_completed: boolean | null;
};

function dayNumber(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/** Consecutive practice days ending on the last practice date (same rule as the live counter). */
function streakEndingOnLastDay(sortedDates: string[]) {
  if (!sortedDates.length) return 0;
  let streak = 1;
  for (let index = sortedDates.length - 1; index > 0; index -= 1) {
    if (dayNumber(sortedDates[index]) - dayNumber(sortedDates[index - 1]) !== 1) break;
    streak += 1;
  }
  return streak;
}

/**
 * Rebuild the milestone state from the saved daily activity, so milestones follow the user to any device.
 * exerciseSeconds(slot, exerciseId) gives the length of an exercise inside that routine.
 */
export function buildMilestoneStateFromActivity(
  productType: VoiceFlexProduct,
  rows: MilestoneActivityRow[],
  exerciseSeconds: (slot: number, exerciseId: string) => number,
  unlockedMilestones: LocalMilestoneState["unlockedMilestones"] = {},
): LocalMilestoneState {
  const state = defaultState(productType);
  const practiceDays = new Set<string>();

  for (const row of rows) {
    const ids = Array.from(new Set(row.completed_exercise_ids ?? []));
    const slot = row.program_day ?? 1;
    if (ids.length || (row.seconds_practiced ?? 0) > 0) practiceDays.add(row.activity_date);
    state.totals.totalSeconds += row.seconds_practiced ?? 0;
    state.totals.exercisesCompleted += ids.length;
    if (row.full_session_completed) state.totals.fullSessionsCompleted += 1;

    for (const id of ids) {
      const exercise = getExercise(id);
      const category = getExerciseCategory(id, exercise?.title ?? id);
      state.exerciseStats[category] += 1;
      const skills = exercise?.skills ?? [];
      if (skills.includes("breath")) state.focusStats.breathSeconds += exerciseSeconds(slot, id);
      if (skills.includes("flexibility")) state.focusStats.flexibilityCount += 1;
      if (skills.includes("pitch")) state.focusStats.pitchExerciseCount += 1;
      if (skills.includes("speaking")) state.focusStats.speakingCount += 1;
    }
  }

  const sortedDays = Array.from(practiceDays).sort();
  state.totals.practiceDays = sortedDays;
  state.totals.currentStreak = streakEndingOnLastDay(sortedDays);
  state.totals.lastPracticeDate = sortedDays.length ? sortedDays[sortedDays.length - 1] : null;
  state.focusStats.consistencyDays = sortedDays.length;

  return withUnlockedMilestones({ ...state, unlockedMilestones: { ...unlockedMilestones } });
}
