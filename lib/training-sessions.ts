import type { GuidePattern } from "@/lib/guide-tones";
import { getDefaultKit, type VoiceFlexKit } from "@/lib/kits";
import { buildRoutineSession, type RoutineId } from "@/lib/routines";
import type { VoiceFlexProduct } from "@/lib/training-product";

export interface TrainingDemoStep {
  title: string;
  subtitle: string;
  imageSrc?: string;
  bullets: string[];
}

export interface TrainingSessionExercise {
  id: string;
  title: string;
  durationSeconds: number;
  tool?: string;
  description: string;
  whatToDoNow: string;
  tips: string[];
  avoid: string[];
  requiresPiano?: boolean;
  demoSteps?: TrainingDemoStep[];
  demoAudioSrc?: string | null;
  accompanimentAudioSrc?: string | null;
  /** Guide tones generated in the browser while the timer runs. */
  guide?: GuidePattern;
}

export interface TrainingSessionConfig {
  productType: VoiceFlexProduct;
  title: string;
  subtitle: string;
  day: number;
  exercises: TrainingSessionExercise[];
}

/**
 * Sessions are now built from the routine library (lib/routines.ts) and the
 * buyer's kit (lib/kits.ts). These wrappers keep the old call sites working:
 * with no routine they return the Daily Session for the product's default kit.
 */
export function getTrainingSessionConfig(
  productType: VoiceFlexProduct,
  kit: VoiceFlexKit = getDefaultKit(productType),
  routineId: RoutineId = "daily",
) {
  return buildRoutineSession(routineId, kit, productType);
}

export function formatSessionDuration(seconds: number) {
  const minutes = Math.round((seconds / 60) * 10) / 10;
  return Number.isInteger(minutes) ? `${minutes} min` : `${minutes.toFixed(1)} min`;
}

export function formatSessionTimer(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function getSessionTotalSeconds(
  productType: VoiceFlexProduct,
  kit: VoiceFlexKit = getDefaultKit(productType),
  routineId: RoutineId = "daily",
) {
  return getTrainingSessionConfig(productType, kit, routineId).exercises.reduce(
    (total, exercise) => total + exercise.durationSeconds,
    0,
  );
}
