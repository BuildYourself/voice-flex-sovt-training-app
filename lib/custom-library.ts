import { EXERCISES, getExercise, getExerciseTitle, getSetupDemoStep, type ExerciseSkill } from "@/lib/exercises";
import { getKitProfile, type KitProfile, type ResistanceLevel, type VoiceFlexKit } from "@/lib/kits";
import { notifyLocalChange } from "@/lib/local-change";
import { buildSessionExercise, resolveRoutineSteps, ROUTINES, type RoutineId } from "@/lib/routines";
import type { TrainingSessionConfig, TrainingSessionExercise } from "@/lib/training-sessions";
import type { VoiceFlexProduct } from "@/lib/training-product";

/**
 * A person's own routines and exercises. Kept in browser storage like the other settings and
 * saved to their account through the progress sync ("library" setting), so they follow the
 * person to any device. The server reads the same data to name and time custom routines.
 *
 * Custom routines get a slot from 101 to 199. The slot is saved as program_day, like the
 * built-in routines (1-10), so history and streaks need no schema change.
 */

export type CustomToolKind = "resistance" | "water" | "none";

export interface CustomExercise {
  id: string;
  title: string;
  instructions: string;
  tool: CustomToolKind;
  seconds: number;
  level: ResistanceLevel;
}

export interface CustomRoutineStep {
  exercise: string;
  seconds: number;
  level: ResistanceLevel;
}

export interface CustomRoutine {
  id: string;
  slot: number;
  title: string;
  steps: CustomRoutineStep[];
}

export interface UserLibrary {
  exercises: CustomExercise[];
  routines: CustomRoutine[];
}

export const CUSTOM_SLOT_MIN = 101;
export const CUSTOM_SLOT_MAX = 199;

export const LIBRARY_LIMITS = {
  routines: 20,
  exercises: 40,
  steps: 15,
  title: 40,
  instructions: 600,
  minSeconds: 15,
  maxSeconds: 600,
  secondsStep: 15,
} as const;

/** Longest stored library, in characters. The server accepts this much for the "library" setting. */
export const LIBRARY_MAX_CHARS = 60_000;

const LEVELS: ResistanceLevel[] = ["lightest", "light", "medium", "strong"];
const EXERCISE_ID = /^c-[a-z0-9]{6,16}$/;
const ROUTINE_ID = /^r-[a-z0-9]{6,16}$/;

export const EMPTY_LIBRARY: UserLibrary = { exercises: [], routines: [] };

export function isCustomSlot(slot: number) {
  return Number.isInteger(slot) && slot >= CUSTOM_SLOT_MIN && slot <= CUSTOM_SLOT_MAX;
}

export function isCustomExerciseId(id: unknown): id is string {
  return typeof id === "string" && EXERCISE_ID.test(id);
}

/** Routine links use ?routine=my-<id>, next to the built-in ?routine=daily. */
export function customRoutineParam(id: string) {
  return `my-${id}`;
}

export function parseCustomRoutineParam(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("my-")) return null;
  const id = value.slice(3);
  return ROUTINE_ID.test(id) ? id : null;
}

function clampSeconds(value: unknown, fallback = 60) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  const { minSeconds, maxSeconds, secondsStep } = LIBRARY_LIMITS;
  return Math.min(maxSeconds, Math.max(minSeconds, Math.round(n / secondsStep) * secondsStep));
}

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

function cleanInstructions(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, LIBRARY_LIMITS.instructions);
}

function cleanLevel(value: unknown): ResistanceLevel {
  return LEVELS.includes(value as ResistanceLevel) ? (value as ResistanceLevel) : "light";
}

/** Read a stored library (JSON text or an object) and drop anything broken or over the limits. */
export function parseLibrary(raw: unknown): UserLibrary {
  let data: unknown = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch {
      return { exercises: [], routines: [] };
    }
  }
  if (!data || typeof data !== "object") return { exercises: [], routines: [] };
  const source = data as { exercises?: unknown; routines?: unknown };

  const exercises: CustomExercise[] = [];
  const seenExercises = new Set<string>();
  for (const item of Array.isArray(source.exercises) ? source.exercises : []) {
    if (exercises.length >= LIBRARY_LIMITS.exercises) break;
    if (!item || typeof item !== "object") continue;
    const e = item as Record<string, unknown>;
    const title = cleanText(e.title, LIBRARY_LIMITS.title);
    if (!isCustomExerciseId(e.id) || seenExercises.has(e.id) || !title) continue;
    seenExercises.add(e.id);
    exercises.push({
      id: e.id,
      title,
      instructions: cleanInstructions(e.instructions),
      tool: e.tool === "water" || e.tool === "none" ? e.tool : "resistance",
      seconds: clampSeconds(e.seconds),
      level: cleanLevel(e.level),
    });
  }

  const routines: CustomRoutine[] = [];
  const seenRoutines = new Set<string>();
  const seenSlots = new Set<number>();
  for (const item of Array.isArray(source.routines) ? source.routines : []) {
    if (routines.length >= LIBRARY_LIMITS.routines) break;
    if (!item || typeof item !== "object") continue;
    const r = item as Record<string, unknown>;
    const title = cleanText(r.title, LIBRARY_LIMITS.title);
    const slot = Number(r.slot);
    if (typeof r.id !== "string" || !ROUTINE_ID.test(r.id) || seenRoutines.has(r.id) || !title) continue;
    if (!isCustomSlot(slot) || seenSlots.has(slot)) continue;

    const steps: CustomRoutineStep[] = [];
    const seenSteps = new Set<string>();
    for (const rawStep of Array.isArray(r.steps) ? r.steps : []) {
      if (steps.length >= LIBRARY_LIMITS.steps) break;
      if (!rawStep || typeof rawStep !== "object") continue;
      const s = rawStep as Record<string, unknown>;
      const exercise = typeof s.exercise === "string" ? s.exercise : "";
      const known = Boolean(getExercise(exercise)) || seenExercises.has(exercise);
      if (!known || seenSteps.has(exercise)) continue;
      seenSteps.add(exercise);
      steps.push({ exercise, seconds: clampSeconds(s.seconds), level: cleanLevel(s.level) });
    }
    if (!steps.length) continue;

    seenRoutines.add(r.id);
    seenSlots.add(slot);
    routines.push({ id: r.id, slot, title, steps });
  }

  return { exercises, routines };
}

export function serializeLibrary(library: UserLibrary) {
  return JSON.stringify(parseLibrary(library));
}

/* ------------------------------------------------------------------ */
/* Browser storage                                                     */
/* ------------------------------------------------------------------ */

export const LIBRARY_CHANGE_EVENT = "voiceflex:library-change";

export function libraryStorageKey(productType: VoiceFlexProduct) {
  return `voiceflex_library_${productType}`;
}

export function readLibrary(productType: VoiceFlexProduct): UserLibrary {
  if (typeof window === "undefined") return { exercises: [], routines: [] };
  try {
    return parseLibrary(window.localStorage.getItem(libraryStorageKey(productType)));
  } catch {
    return { exercises: [], routines: [] };
  }
}

/** Save and queue a sync to the account. Returns false when the browser blocks storage. */
export function saveLibrary(productType: VoiceFlexProduct, library: UserLibrary) {
  if (typeof window === "undefined") return false;
  try {
    const text = serializeLibrary(library);
    if (text.length > LIBRARY_MAX_CHARS) return false;
    window.localStorage.setItem(libraryStorageKey(productType), text);
    window.dispatchEvent(new Event(LIBRARY_CHANGE_EVENT));
    notifyLocalChange();
    return true;
  } catch {
    return false;
  }
}

function randomId(prefix: "c" | "r") {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(10);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  else bytes.forEach((_, i) => (bytes[i] = Math.floor(Math.random() * 256)));
  return `${prefix}-${Array.from(bytes, (b) => chars[b % chars.length]).join("")}`;
}

export function newExerciseId() {
  return randomId("c");
}

export function newRoutineId() {
  return randomId("r");
}

/**
 * The next free slot. Slots of deleted routines are not handed out again while they still appear
 * in this device's history, so old history never shows a new routine's name.
 */
export function nextRoutineSlot(library: UserLibrary, usedSlots: Iterable<number> = []) {
  const taken = new Set<number>([...library.routines.map((routine) => routine.slot), ...usedSlots]);
  for (let slot = CUSTOM_SLOT_MIN; slot <= CUSTOM_SLOT_MAX; slot += 1) {
    if (!taken.has(slot)) return slot;
  }
  // Every slot has been used once: reuse the lowest one no current routine holds.
  const current = new Set(library.routines.map((routine) => routine.slot));
  for (let slot = CUSTOM_SLOT_MIN; slot <= CUSTOM_SLOT_MAX; slot += 1) {
    if (!current.has(slot)) return slot;
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Kit wording                                                         */
/* ------------------------------------------------------------------ */

export type LevelOption = { level: ResistanceLevel; label: string };

/**
 * The resistance choices this kit really has, named the way the kit names them. Levels that use
 * the same tool collapse into one choice (the straw set has two straw sizes, GO has one trainer).
 */
export function getLevelOptions(profile: KitProfile): LevelOption[] {
  const seen = new Set<string>();
  const options: LevelOption[] = [];
  for (const level of LEVELS) {
    const label = profile.resistanceTool[level];
    if (seen.has(label)) continue;
    seen.add(label);
    options.push({ level, label });
  }
  return options;
}

/** Map any level to the choice that names the same tool, so a stored level always matches an option. */
export function normalizeLevel(profile: KitProfile, level: ResistanceLevel): ResistanceLevel {
  const label = profile.resistanceTool[level];
  return getLevelOptions(profile).find((option) => option.label === label)?.level ?? level;
}

export function customToolLabel(exercise: CustomExercise, profile: KitProfile, level: ResistanceLevel) {
  if (exercise.tool === "none") return profile.noToolLabel;
  if (exercise.tool === "water") return profile.waterTool ?? profile.resistanceTool[level];
  return profile.resistanceTool[level];
}

/* ------------------------------------------------------------------ */
/* Exercises available to pick                                         */
/* ------------------------------------------------------------------ */

export type LibraryExercise = {
  id: string;
  title: string;
  skills: ExerciseSkill[];
  toolKind: CustomToolKind;
  custom: boolean;
  defaultSeconds: number;
  defaultLevel: ResistanceLevel;
};

/** Default length and level of a built-in exercise: how the Daily Session (or the first routine using it) runs it. */
function builtInDefaults(id: string, kit: VoiceFlexKit) {
  for (const routine of Object.values(ROUTINES)) {
    const step = resolveRoutineSteps(routine.id, kit).find((item) => item.exercise === id);
    if (step) return { seconds: step.seconds, level: step.level };
  }
  return { seconds: 60, level: "light" as ResistanceLevel };
}

/** Built-in exercises this kit can do (water ones only with water), then the person's own. */
export function listLibraryExercises(kit: VoiceFlexKit, library: UserLibrary): LibraryExercise[] {
  const profile = getKitProfile(kit);
  const builtIn = Object.values(EXERCISES)
    .filter((exercise) => exercise.toolKind !== "water" || profile.hasWater)
    .map((exercise) => {
      const defaults = builtInDefaults(exercise.id, kit);
      return {
        id: exercise.id,
        title: getExerciseTitle(exercise, profile),
        skills: exercise.skills,
        toolKind: exercise.toolKind,
        custom: false,
        defaultSeconds: defaults.seconds,
        defaultLevel: normalizeLevel(profile, defaults.level),
      };
    });
  const own = library.exercises
    .filter((exercise) => exercise.tool !== "water" || profile.hasWater)
    .map((exercise) => ({
      id: exercise.id,
      title: exercise.title,
      skills: [] as ExerciseSkill[],
      toolKind: exercise.tool,
      custom: true,
      defaultSeconds: exercise.seconds,
      defaultLevel: normalizeLevel(profile, exercise.level),
    }));
  return [...builtIn, ...own];
}

export function getExerciseName(id: string, library: UserLibrary, profile: KitProfile) {
  const builtIn = getExercise(id);
  if (builtIn) return getExerciseTitle(builtIn, profile);
  return library.exercises.find((exercise) => exercise.id === id)?.title ?? "Exercise";
}

/* ------------------------------------------------------------------ */
/* Routines                                                            */
/* ------------------------------------------------------------------ */

/** A built-in routine's steps as a starting point for a custom one. */
export function stepsFromBuiltIn(id: RoutineId, kit: VoiceFlexKit): CustomRoutineStep[] {
  const profile = getKitProfile(kit);
  const seen = new Set<string>();
  return resolveRoutineSteps(id, kit).flatMap((step) => {
    if (seen.has(step.exercise)) return [];
    seen.add(step.exercise);
    return [{ exercise: step.exercise, seconds: step.seconds, level: normalizeLevel(profile, step.level) }];
  });
}

/** Steps whose exercise still exists and works with this kit. */
export function playableSteps(routine: CustomRoutine, library: UserLibrary, kit: VoiceFlexKit) {
  const profile = getKitProfile(kit);
  return routine.steps.filter((step) => {
    const builtIn = getExercise(step.exercise);
    if (builtIn) return builtIn.toolKind !== "water" || profile.hasWater;
    const own = library.exercises.find((exercise) => exercise.id === step.exercise);
    return Boolean(own) && (own?.tool !== "water" || profile.hasWater);
  });
}

export function customRoutineSeconds(routine: CustomRoutine, library: UserLibrary, kit: VoiceFlexKit) {
  return playableSteps(routine, library, kit).reduce((total, step) => total + step.seconds, 0);
}

export function customRoutineSkills(routine: CustomRoutine, library: UserLibrary, kit: VoiceFlexKit): ExerciseSkill[] {
  const skills = new Set<ExerciseSkill>();
  playableSteps(routine, library, kit).forEach((step) => getExercise(step.exercise)?.skills.forEach((skill) => skills.add(skill)));
  return (["breath", "flexibility", "pitch", "speaking"] as ExerciseSkill[]).filter((skill) => skills.has(skill));
}

function customSessionExercise(exercise: CustomExercise, profile: KitProfile, step: CustomRoutineStep): TrainingSessionExercise {
  const level = normalizeLevel(profile, step.level);
  const instructions = exercise.instructions || "Do this exercise the way you usually do. Keep it light and easy.";
  return {
    id: exercise.id,
    title: exercise.title,
    durationSeconds: step.seconds,
    tool: customToolLabel(exercise, profile, level),
    description: instructions,
    whatToDoNow: "Follow your instructions for the whole step. Keep it light and easy.",
    tips: ["Easy, comfortable volume", "Shoulders and jaw loose", "Breathe in through your nose when you need to"],
    avoid: ["Pushing or straining", "Carrying on through pain or scratchiness"],
    demoSteps: exercise.tool === "resistance" ? [getSetupDemoStep(profile, level)] : undefined,
    demoAudioSrc: null,
    accompanimentAudioSrc: null,
  };
}

/** A custom routine as a session the training player can run. */
export function buildCustomRoutineSession(
  routine: CustomRoutine,
  library: UserLibrary,
  kit: VoiceFlexKit,
  productType: VoiceFlexProduct,
): TrainingSessionConfig {
  const profile = getKitProfile(kit);
  const exercises = playableSteps(routine, library, kit).flatMap((step) => {
    const builtIn = buildSessionExercise({ exercise: step.exercise, seconds: step.seconds, level: normalizeLevel(profile, step.level) }, profile);
    if (builtIn) return [builtIn];
    const own = library.exercises.find((exercise) => exercise.id === step.exercise);
    return own ? [customSessionExercise(own, profile, step)] : [];
  });
  return {
    productType,
    title: routine.title,
    subtitle: "Your own routine.",
    day: routine.slot,
    exercises,
  };
}

/* ------------------------------------------------------------------ */
/* Server helpers                                                      */
/* ------------------------------------------------------------------ */

/** Step lengths and titles of a custom routine, for saving completions on the server. */
export function describeCustomSlot(library: UserLibrary, slot: number) {
  const routine = library.routines.find((item) => item.slot === slot);
  if (!routine) return null;
  return {
    title: routine.title,
    seconds: new Map(routine.steps.map((step) => [step.exercise, step.seconds])),
    titles: new Map(
      routine.steps.map((step) => [
        step.exercise,
        getExercise(step.exercise)?.title ?? library.exercises.find((exercise) => exercise.id === step.exercise)?.title ?? step.exercise,
      ]),
    ),
  };
}
