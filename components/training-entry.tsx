"use client";

import { useRouter } from "next/navigation";
import { type VoiceFlexProduct } from "@/lib/training-product";
import type { RoutineId } from "@/lib/routines";
import { useTrainingProgress } from "@/hooks/use-training-progress";
import { TrainingOnboarding } from "@/components/training-onboarding";
import { TrainingRoutinePicker } from "@/components/training-routine-picker";
import { TrainingSession } from "@/components/training-session";

export function TrainingEntry({
  product,
  routineId,
  showSetup = false
}: {
  product: VoiceFlexProduct;
  routineId?: RoutineId;
  showSetup?: boolean;
}) {
  const router = useRouter();
  const { progress, kit, loading, markOnboardingCompleted, resetProgress } = useTrainingProgress(product);

  if (loading || !progress) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-4 text-navy-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 font-black shadow-card">Preparing your training setup...</div>
      </main>
    );
  }

  if (!progress.onboardingCompleted || showSetup) {
    return (
      <TrainingOnboarding
        productType={product}
        kit={kit}
        progress={progress}
        onComplete={() => {
          markOnboardingCompleted();
          router.push(`/train/${product}`);
        }}
        onReset={() => resetProgress()}
      />
    );
  }

  if (routineId) {
    return <TrainingSession key={routineId} productType={product} routineId={routineId} />;
  }

  return <TrainingRoutinePicker productType={product} />;
}
