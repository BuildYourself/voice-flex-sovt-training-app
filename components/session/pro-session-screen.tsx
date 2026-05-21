"use client";

import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionPlayer } from "@/hooks/useSessionPlayer";
import type { DbExercise } from "@/lib/programs-client";
import { resolveSessionSteps } from "@/lib/session/resolve-session";
import { SessionFlow } from "@/components/session/SessionFlow";
import { HelperCards, SessionPlayer } from "@/components/session/SessionPlayer";
import { SessionOverview } from "@/components/session/SessionOverview";
import { useMemo } from "react";

export function ProSessionScreen({ initialExercises }: { initialExercises: DbExercise[] }) {
  const router = useRouter();
  const steps = useMemo(() => resolveSessionSteps(initialExercises), [initialExercises]);

  const player = useSessionPlayer({
    steps,
    onSessionComplete: () => {
      router.push("/progress");
    }
  });

  const current = player.currentStep;
  const stepProgress = current ? ((current.durationSec - player.remainingSeconds) / Math.max(1, current.durationSec)) * 100 : 0;

  if (!steps.length || !current) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-600">Training plan not found. Please run the programs seed SQL.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-6 2xl:grid-cols-[330px_minmax(0,1fr)_390px]">
        <SessionFlow steps={steps} currentStepIndex={player.currentStepIndex} completedStepIds={player.completedStepIds} />

        <div className="order-1 space-y-5 2xl:order-2">
          <SessionPlayer
            step={current}
            stepIndex={player.currentStepIndex}
            totalSteps={steps.length}
            mode={player.mode}
            remainingSeconds={player.remainingSeconds}
            stepProgress={stepProgress}
            playDemo={player.playDemo}
            stopDemo={player.stopDemo}
            startPractice={player.startPractice}
            pausePractice={player.pausePractice}
            resumePractice={player.resumePractice}
            previousStep={player.previousStep}
            skipStep={player.skipStep}
            isDemoPlaying={player.isDemoPlaying}
            isPracticeAudioPlaying={player.isPracticeAudioPlaying}
          />
          <HelperCards step={current} />
        </div>

        <SessionOverview
          steps={steps}
          currentStepIndex={player.currentStepIndex}
          completedCount={player.completedStepIds.length}
          elapsedSeconds={player.elapsedSeconds}
          totalSeconds={player.totalSeconds}
          mode={player.mode}
        />
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-slate-800 sm:px-6">
        <Shield className="mr-3 inline h-6 w-6 text-amber-500" />
        <b>Safety Note:</b> {current.safetyNote}
      </div>
    </div>
  );
}
