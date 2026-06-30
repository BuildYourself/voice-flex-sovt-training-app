"use client";

import { type VoiceFlexProduct } from "@/lib/training-product";
import { useTrainingProgress } from "@/hooks/use-training-progress";
import { TrainingOnboarding } from "@/components/training-onboarding";
import { TrainingSession } from "@/components/training-session";

export function TrainingEntry({ product }: { product: VoiceFlexProduct }) {
  const { progress, loading, markOnboardingCompleted, resetProgress } = useTrainingProgress(product);

  if (loading || !progress) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-4 text-navy-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 font-black shadow-card">Preparing your training setup...</div>
      </main>
    );
  }

  if (!progress.onboardingCompleted) {
    return <TrainingOnboarding productType={product} progress={progress} onComplete={() => markOnboardingCompleted()} onReset={() => resetProgress()} />;
  }

  return <TrainingSession productType={product} />;
}
