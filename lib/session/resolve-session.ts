import type { DbExercise } from "@/lib/programs-client";
import { exerciseLibrary, type ExerciseDefinition } from "@/lib/session/exercise-library";
import { todayGuidedSessionTemplate, type SessionStepUsage, type SessionTemplate } from "@/lib/session/session-data";

export interface ResolvedSessionStep {
  id: string;
  exerciseId: string;
  title: string;
  position: number;
  durationSec: number;
  displayDuration: string;
  tool: string;
  instructions: string;
  requiresPiano: boolean;
  demoAudioUrl: string | null;
  practiceAudioUrl: string | null;
  demoDurationLabel: string;
  whatToDoNow: string;
  tips: string[];
  mistakes: string[];
  safetyNote: string;
}

const defaultSafetyNote = "If you feel pain, discomfort, dizziness, or scratchiness, stop and rest. These exercises should feel easy and relaxed.";

function normalizeLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/[“”"']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const exerciseById = new Map(exerciseLibrary.map((item) => [item.id, item]));
const exerciseIdByNormalizedTitle = new Map(exerciseLibrary.map((item) => [normalizeLabel(item.title), item.id]));

function formatDuration(durationSec: number) {
  const minutes = durationSec / 60;
  return Number.isInteger(minutes) ? `${minutes} min` : `${minutes.toFixed(1)} min`;
}

function buildWhatToDoNow(step: ResolvedSessionStep) {
  if (step.requiresPiano) {
    return "Listen to the demo first, then repeat with the piano accompaniment.";
  }
  return "Listen to the demo first, then start the timer and perform the exercise calmly.";
}

function resolveStep(exercise: ExerciseDefinition, step: SessionStepUsage, dbExercise?: DbExercise): ResolvedSessionStep {
  const requiresPiano = step.requiresPianoOverride ?? exercise.requiresPianoDefault ?? false;
  const durationSec = step.durationSec ?? dbExercise?.duration_seconds ?? 60;
  const demoAudioUrl = step.demoAudioUrlOverride ?? exercise.demoAudioUrl ?? null;
  const practiceAudioUrl = step.practiceAudioUrlOverride ?? exercise.practiceAudioUrl ?? null;
  const instructions = step.instructionsOverride ?? dbExercise?.instruction ?? exercise.instructions;
  const tool = dbExercise?.tool || exercise.defaultTool;
  const tips = dbExercise?.how_it_should_feel?.length ? dbExercise.how_it_should_feel : exercise.tips;
  const mistakes = dbExercise?.common_mistakes?.length ? dbExercise.common_mistakes : exercise.mistakes;

  const resolved: ResolvedSessionStep = {
    id: dbExercise?.id ?? `${exercise.id}-${step.position}`,
    exerciseId: exercise.id,
    title: dbExercise?.title || exercise.title,
    position: step.position,
    durationSec,
    displayDuration: dbExercise?.display_duration || formatDuration(durationSec),
    tool,
    instructions,
    requiresPiano,
    demoAudioUrl,
    practiceAudioUrl,
    demoDurationLabel: "0:16",
    whatToDoNow: dbExercise?.what_to_do_now || "",
    tips,
    mistakes,
    safetyNote: dbExercise?.safety_note || defaultSafetyNote
  };

  resolved.whatToDoNow = resolved.whatToDoNow || buildWhatToDoNow(resolved);
  return resolved;
}

function templateToResolved(template: SessionTemplate): ResolvedSessionStep[] {
  return template.steps
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((step) => {
      const exercise = exerciseById.get(step.exerciseId);
      if (!exercise) {
        return {
          id: `${step.exerciseId}-${step.position}`,
          exerciseId: step.exerciseId,
          title: step.exerciseId,
          position: step.position,
          durationSec: step.durationSec ?? 60,
          displayDuration: formatDuration(step.durationSec ?? 60),
          tool: "Voice Flex Tool",
          instructions: "Follow the guided exercise instructions.",
          requiresPiano: step.requiresPianoOverride ?? false,
          demoAudioUrl: step.demoAudioUrlOverride ?? null,
          practiceAudioUrl: step.practiceAudioUrlOverride ?? null,
          demoDurationLabel: "0:16",
          whatToDoNow: step.requiresPianoOverride ? "Listen to the demo first, then repeat with the piano accompaniment." : "Listen to the demo first, then start the timer and perform the exercise calmly.",
          tips: [],
          mistakes: [],
          safetyNote: defaultSafetyNote
        } satisfies ResolvedSessionStep;
      }
      return resolveStep(exercise, step);
    });
}

export function resolveSessionSteps(dbExercises: DbExercise[], template: SessionTemplate = todayGuidedSessionTemplate): ResolvedSessionStep[] {
  if (!dbExercises.length) return templateToResolved(template);

  const sorted = dbExercises.slice().sort((a, b) => a.sort_order - b.sort_order);
  const templateByPosition = new Map(template.steps.map((step) => [step.position, step]));

  return sorted.map((dbExercise, index) => {
    const inferredId = exerciseIdByNormalizedTitle.get(normalizeLabel(dbExercise.title));
    const templateStep = templateByPosition.get(index + 1);
    const exerciseId = inferredId ?? templateStep?.exerciseId ?? "voice-check";
    const exercise = exerciseById.get(exerciseId) ?? exerciseById.get("voice-check")!;
    const usage: SessionStepUsage = {
      exerciseId,
      durationSec: dbExercise.duration_seconds ?? templateStep?.durationSec ?? 60,
      position: index + 1,
      requiresPianoOverride: templateStep?.requiresPianoOverride,
      demoAudioUrlOverride: templateStep?.demoAudioUrlOverride,
      practiceAudioUrlOverride: templateStep?.practiceAudioUrlOverride,
      instructionsOverride: dbExercise.instruction ?? templateStep?.instructionsOverride
    };
    return resolveStep(exercise, usage, dbExercise);
  });
}

