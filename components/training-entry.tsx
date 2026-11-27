"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type VoiceFlexProduct } from "@/lib/training-product";
import type { RoutineId } from "@/lib/routines";
import { getDefaultKit } from "@/lib/kits";
import { playableSteps, type CustomRoutine, type UserLibrary } from "@/lib/custom-library";
import { useCustomLibrary } from "@/hooks/use-custom-library";
import { useTrainingProgress } from "@/hooks/use-training-progress";
import { TrainingOnboarding } from "@/components/training-onboarding";
import { TrainingRoutinePicker } from "@/components/training-routine-picker";
import { TrainingSession } from "@/components/training-session";

export function TrainingEntry({
  product,
  routineId,
  customRoutineId,
  showSetup = false
}: {
  product: VoiceFlexProduct;
  routineId?: RoutineId;
  /** One of the person's own routines (?routine=my-<id>). */
  customRoutineId?: string;
  showSetup?: boolean;
}) {
  const router = useRouter();
  const { progress, kit, caps, loading, markOnboardingCompleted } = useTrainingProgress(product);

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
        caps={caps}
        progress={progress}
        onComplete={() => {
          markOnboardingCompleted();
          router.push(`/train/${product}`);
        }}
      />
    );
  }

  if (routineId) {
    return <TrainingSession key={routineId} productType={product} routineId={routineId} />;
  }

  if (customRoutineId) {
    return <CustomRoutineEntry key={customRoutineId} product={product} routineId={customRoutineId} />;
  }

  return <TrainingRoutinePicker productType={product} />;
}

/** Runs one of the person's own routines. The routine is fixed when it opens, so an edit elsewhere can't change a running session. */
function CustomRoutineEntry({ product, routineId }: { product: VoiceFlexProduct; routineId: string }) {
  const { library, ready } = useCustomLibrary(product);
  const { kit } = useTrainingProgress(product);
  const [frozen, setFrozen] = useState<{ routine: CustomRoutine; library: UserLibrary } | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!ready || frozen) return;
    const routine = library.routines.find((item) => item.id === routineId);
    if (routine && playableSteps(routine, library, kit ?? getDefaultKit(product)).length) {
      setFrozen({ routine, library });
      setMissing(false);
    } else {
      setMissing(true);
    }
  }, [ready, frozen, library, routineId, kit, product]);

  if (frozen) {
    return <TrainingSession productType={product} custom={frozen} />;
  }

  if (missing) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-4 text-navy-950">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-card">
          <p className="text-xl font-black">This routine isn&apos;t here any more</p>
          <p className="mt-2 text-slate-600">It may have been deleted on another device.</p>
          <Link href={`/train/${product}`} className="mt-5 inline-flex h-11 items-center rounded-xl bg-electric-600 px-5 font-black text-white">
            Back to routines
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-4 text-navy-950">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 font-black shadow-card">Loading your routine...</div>
    </main>
  );
}
