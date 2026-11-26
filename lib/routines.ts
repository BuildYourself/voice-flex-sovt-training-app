import { getExercise, getExerciseToolLabel, type ExerciseSkill } from "@/lib/exercises";
import { getKitProfile, type ResistanceLevel, type VoiceFlexKit } from "@/lib/kits";
import type { VoiceFlexProduct } from "@/lib/training-product";
import type { TrainingSessionConfig, TrainingSessionExercise } from "@/lib/training-sessions";

/**
 * Routines the user picks and switches between. Each routine has a fixed
 * "slot". The slot is stored as program_day in voiceflex_daily_activity, so
 * one row per (order, date, routine) needs no schema change. The Daily
 * Session keeps slot 1, so every row saved before routines existed still
 * reads as a Daily Session.
 */
export type RoutineId =
  | "daily"
  | "quick-reset"
  | "quick-warmup"
  | "full-warmup"
  | "breath"
  | "flexibility"
  | "pitch"
  | "speaking"
  | "cooldown"
  | "tired";

export interface RoutineStep {
  exercise: string;
  /** Used instead of `exercise` when that one needs water and the kit has none. */
  dry?: string;
  seconds: number;
  level: ResistanceLevel;
  /** Extra line added to the exercise description for this routine only. */
  note?: string;
}

export interface RoutineDefinition {
  id: RoutineId;
  slot: number;
  title: string;
  /** Who or when it's for, one line. */
  forWhen: string;
  resistanceLabel: string;
  /** Short safety or context note shown before the routine starts. */
  intro?: string;
  steps: RoutineStep[] | ((kit: VoiceFlexKit) => RoutineStep[]);
}

const PRO_DAILY: RoutineStep[] = [
  { exercise: "easy-bubbles", seconds: 60, level: "light" },
  { exercise: "soft-mmm", seconds: 60, level: "light" },
  { exercise: "siren", seconds: 120, level: "medium" },
  { exercise: "five-notes", seconds: 120, level: "medium" },
  { exercise: "arpeggio", seconds: 120, level: "medium" },
  { exercise: "two-notes", seconds: 90, level: "medium" },
  { exercise: "voice-check", seconds: 60, level: "light" },
];

const DRY_DAILY: RoutineStep[] = [
  { exercise: "waves", seconds: 60, level: "light" },
  { exercise: "siren", seconds: 90, level: "medium" },
  { exercise: "two-notes", seconds: 90, level: "medium" },
  { exercise: "arpeggio", seconds: 90, level: "medium" },
  { exercise: "five-notes", seconds: 90, level: "medium" },
  { exercise: "voice-check", seconds: 30, level: "light" },
];

export const ROUTINES: Record<RoutineId, RoutineDefinition> = {
  daily: {
    id: "daily",
    slot: 1,
    title: "Daily Session",
    forWhen: "The all-round everyday routine. A good place to start.",
    resistanceLabel: "Light, then medium",
    steps: (kit) => (kit === "pro_classic" || kit === "pro" ? PRO_DAILY : DRY_DAILY),
  },
  "quick-reset": {
    id: "quick-reset",
    slot: 2,
    title: "Quick Reset",
    forWhen: "Between sets, classes or long calls, when your voice starts to feel pressed.",
    resistanceLabel: "Light",
    steps: [
      { exercise: "siren", seconds: 60, level: "light" },
      { exercise: "pitch-hills", seconds: 30, level: "light" },
      { exercise: "voice-check", seconds: 30, level: "light" },
    ],
  },
  "quick-warmup": {
    id: "quick-warmup",
    slot: 3,
    title: "Quick Warm-up",
    forWhen: "Short on time before singing or speaking.",
    resistanceLabel: "Light, then medium",
    steps: [
      { exercise: "steady-air", seconds: 30, level: "light" },
      { exercise: "siren", seconds: 60, level: "light" },
      { exercise: "pitch-hills", seconds: 60, level: "medium" },
      { exercise: "voice-check", seconds: 30, level: "light" },
    ],
  },
  "full-warmup": {
    id: "full-warmup",
    slot: 4,
    title: "Full Warm-up",
    forWhen: "Before a rehearsal, a lesson or a show.",
    resistanceLabel: "Light, then medium",
    steps: [
      { exercise: "easy-bubbles", dry: "steady-air", seconds: 60, level: "light" },
      { exercise: "soft-mmm", dry: "waves", seconds: 60, level: "light" },
      { exercise: "siren", seconds: 120, level: "light" },
      { exercise: "pitch-hills", seconds: 60, level: "medium" },
      { exercise: "five-notes", seconds: 90, level: "medium" },
      { exercise: "arpeggio", seconds: 90, level: "medium" },
      { exercise: "your-song", seconds: 60, level: "medium" },
      { exercise: "voice-check", seconds: 60, level: "light" },
    ],
  },
  breath: {
    id: "breath",
    slot: 5,
    title: "Breath Control",
    forWhen: "Steadier air and longer phrases.",
    resistanceLabel: "Medium",
    steps: [
      { exercise: "easy-bubbles", dry: "steady-air", seconds: 90, level: "light" },
      { exercise: "long-hum-hold", seconds: 120, level: "medium" },
      { exercise: "pitch-hills", seconds: 90, level: "medium" },
      { exercise: "straw-counting", seconds: 60, level: "medium" },
      { exercise: "voice-check", seconds: 60, level: "light" },
    ],
  },
  flexibility: {
    id: "flexibility",
    slot: 6,
    title: "Vocal Flexibility",
    forWhen: "More range and a smoother move between low and high notes.",
    resistanceLabel: "Medium",
    steps: [
      { exercise: "waves", seconds: 60, level: "light" },
      { exercise: "siren", seconds: 120, level: "medium" },
      { exercise: "slide-151", seconds: 90, level: "medium" },
      { exercise: "arpeggio", seconds: 120, level: "medium" },
      { exercise: "gentle-descents", seconds: 60, level: "lightest" },
      { exercise: "voice-check", seconds: 30, level: "light" },
    ],
  },
  pitch: {
    id: "pitch",
    slot: 7,
    title: "Pitch Stability",
    forWhen: "Cleaner, steadier notes.",
    resistanceLabel: "Medium",
    steps: [
      { exercise: "steady-note", seconds: 90, level: "medium" },
      { exercise: "two-notes", seconds: 90, level: "medium" },
      { exercise: "five-notes", seconds: 120, level: "medium" },
      { exercise: "arpeggio", seconds: 90, level: "medium" },
      { exercise: "swell", seconds: 60, level: "medium" },
      { exercise: "voice-check", seconds: 30, level: "light" },
    ],
  },
  speaking: {
    id: "speaking",
    slot: 8,
    title: "Speaking Voice",
    forWhen: "Teachers, presenters, long calls, or first thing in the morning.",
    resistanceLabel: "Light",
    steps: [
      { exercise: "soft-mmm", dry: "steady-air", seconds: 60, level: "light" },
      { exercise: "waves", seconds: 60, level: "light" },
      { exercise: "hum-to-speech", seconds: 60, level: "light" },
      { exercise: "straw-counting", seconds: 60, level: "light" },
      { exercise: "straw-to-words", seconds: 90, level: "light" },
      { exercise: "voice-check", seconds: 30, level: "light" },
    ],
  },
  cooldown: {
    id: "cooldown",
    slot: 9,
    title: "Cool-down",
    forWhen: "After singing or a long day of talking.",
    resistanceLabel: "Lightest",
    steps: [
      { exercise: "gentle-descents", seconds: 90, level: "lightest" },
      { exercise: "soft-mmm", dry: "waves", seconds: 60, level: "lightest" },
      { exercise: "hum-to-speech", seconds: 60, level: "lightest" },
      { exercise: "yawn-sigh", seconds: 30, level: "lightest" },
      { exercise: "voice-check", seconds: 60, level: "lightest" },
    ],
  },
  tired: {
    id: "tired",
    slot: 10,
    title: "Tired Voice",
    forWhen: "When your voice feels worn after heavy use. Quiet and slow.",
    resistanceLabel: "Lightest",
    intro:
      "Keep everything quiet and slow. Stop if anything hurts. This routine isn't for an injured voice, and hoarseness that hasn't improved after 4 weeks needs a doctor.",
    steps: [
      { exercise: "easy-bubbles", dry: "steady-air", seconds: 60, level: "lightest" },
      { exercise: "waves", seconds: 90, level: "lightest" },
      { exercise: "long-hum-hold", seconds: 60, level: "lightest", note: "Keep it soft and in the middle of your voice." },
      { exercise: "yawn-sigh", seconds: 30, level: "lightest" },
      { exercise: "voice-check", seconds: 60, level: "lightest" },
    ],
  },
};

/** Order on the picker. The Daily Session is shown first and larger. */
export const ROUTINE_ORDER: RoutineId[] = [
  "daily",
  "quick-reset",
  "quick-warmup",
  "full-warmup",
  "breath",
  "flexibility",
  "pitch",
  "speaking",
  "cooldown",
  "tired",
];

export function isRoutineId(value: unknown): value is RoutineId {
  return typeof value === "string" && value in ROUTINES;
}

export function getRoutine(id: RoutineId) {
  return ROUTINES[id];
}

export function getRoutineBySlot(slot: number | null | undefined) {
  return Object.values(ROUTINES).find((routine) => routine.slot === (slot ?? 1)) ?? ROUTINES.daily;
}

export function isRoutineSlot(slot: number) {
  return Object.values(ROUTINES).some((routine) => routine.slot === slot);
}

/** Steps for this kit, with water exercises swapped for kits without water. */
export function resolveRoutineSteps(id: RoutineId, kit: VoiceFlexKit) {
  const routine = ROUTINES[id];
  const profile = getKitProfile(kit);
  const steps = typeof routine.steps === "function" ? routine.steps(kit) : routine.steps;
  return steps.map((step) => {
    const primary = getExercise(step.exercise);
    const useDry = primary?.toolKind === "water" && !profile.hasWater && step.dry;
    return { ...step, exercise: useDry ? (step.dry as string) : step.exercise };
  });
}

export function getRoutineTotalSeconds(id: RoutineId, kit: VoiceFlexKit) {
  return resolveRoutineSteps(id, kit).reduce((total, step) => total + step.seconds, 0);
}

export function getRoutineSkills(id: RoutineId, kit: VoiceFlexKit): ExerciseSkill[] {
  const skills = new Set<ExerciseSkill>();
  resolveRoutineSteps(id, kit).forEach((step) => getExercise(step.exercise)?.skills.forEach((skill) => skills.add(skill)));
  return (["breath", "flexibility", "pitch", "speaking"] as ExerciseSkill[]).filter((skill) => skills.has(skill));
}

export function buildRoutineSession(id: RoutineId, kit: VoiceFlexKit, productType: VoiceFlexProduct): TrainingSessionConfig {
  const routine = ROUTINES[id];
  const profile = getKitProfile(kit);
  const exercises: TrainingSessionExercise[] = resolveRoutineSteps(id, kit).flatMap((step) => {
    const exercise = getExercise(step.exercise);
    if (!exercise) return [];
    const text = exercise.text(profile, step.level);
    return [
      {
        id: exercise.id,
        title: exercise.title,
        durationSeconds: step.seconds,
        tool: getExerciseToolLabel(exercise, profile, step.level),
        description: step.note ? `${text.description} ${step.note}` : text.description,
        whatToDoNow: text.whatToDoNow,
        tips: text.tips,
        avoid: text.avoid,
        requiresPiano: exercise.requiresPiano,
        demoSteps: exercise.demoSteps?.(profile, step.level),
        demoAudioSrc: exercise.demoAudioSrc ?? null,
        accompanimentAudioSrc: exercise.accompanimentAudioSrc ?? null,
        guide: exercise.guide,
      },
    ];
  });

  return {
    productType,
    title: routine.title,
    subtitle: routine.intro ?? routine.forWhen,
    day: routine.slot,
    exercises,
  };
}

export const SKILL_LABELS: Record<ExerciseSkill, string> = {
  breath: "Breath",
  flexibility: "Flexibility",
  pitch: "Pitch",
  speaking: "Speaking",
};
