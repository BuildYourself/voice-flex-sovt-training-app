"use client";

import { Shield } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionPlayer } from "@/hooks/useSessionPlayer";
import type { DbExercise } from "@/lib/programs-client";
import { createClient } from "@/lib/supabase/client";
import { getLocalDateString } from "@/lib/session/date-utils";
import { resolveSessionSteps } from "@/lib/session/resolve-session";
import { getTodaySessionProgress, upsertCompletedSessionStep, type UserSessionStepRow } from "@/lib/session/session-progress-db";
import { SessionFlow } from "@/components/session/SessionFlow";
import { HelperCards, SessionPlayer } from "@/components/session/SessionPlayer";
import { SessionOverview } from "@/components/session/SessionOverview";
import { todayGuidedSessionTemplate } from "@/lib/session/session-data";

export function ProSessionScreen({ initialExercises }: { initialExercises: DbExercise[] }) {
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressSyncError, setProgressSyncError] = useState<string | null>(null);
  const [persistedRows, setPersistedRows] = useState<UserSessionStepRow[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  const sessionDate = useMemo(() => getLocalDateString(), []);
  const sessionId = todayGuidedSessionTemplate.id;
  const steps = useMemo(() => resolveSessionSteps(initialExercises), [initialExercises]);
  const persistedCompletedDurations = useMemo(() => {
    const map: Record<string, number> = {};
    for (const row of persistedRows) {
      const key = `${row.exercise_id}:${row.step_index}`;
      map[key] = row.duration_sec;
    }
    return map;
  }, [persistedRows]);

  const player = useSessionPlayer({
    steps,
    onSessionComplete: () => {},
    onStepCompleted: async (step, stepIndex) => {
      if (!sessionUserId) {
        console.warn("[session] No authenticated user. Step completion synced locally only.");
        return;
      }

      try {
        const supabase = createClient();
        await upsertCompletedSessionStep({
          supabase,
          userId: sessionUserId,
          sessionId,
          sessionDate,
          exerciseId: step.exerciseId,
          stepIndex,
          durationSec: step.durationSec,
          status: "completed"
        });
      } catch (error) {
        console.error("[session] Failed to persist completed step to Supabase.", error);
        setProgressSyncError("Progress sync issue. Your local progress is still active.");
      }
    },
    persistedCompletedDurations
  });
  const { hydrateProgress } = player;

  useEffect(() => {
    let cancelled = false;

    const loadProgress = async () => {
      setProgressLoading(true);
      setProgressSyncError(null);
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          console.warn("[session] No authenticated user found. Session progress will remain local.");
          if (!cancelled) {
            setSessionUserId(null);
          }
          return;
        }

        if (!cancelled) {
          setSessionUserId(user.id);
        }

        const rows = await getTodaySessionProgress({
          supabase,
          userId: user.id,
          sessionId,
          sessionDate
        });

        if (cancelled) return;
        setPersistedRows(rows);
        hydrateProgress(rows.map((row) => `${row.exercise_id}:${row.step_index}`));
      } catch (error) {
        console.error("[session] Failed to load persisted session progress.", error);
        if (!cancelled) {
          setProgressSyncError("Could not load synced progress. Continuing with local session state.");
        }
      } finally {
        if (!cancelled) {
          setProgressLoading(false);
        }
      }
    };

    void loadProgress();

    return () => {
      cancelled = true;
    };
  }, [hydrateProgress, sessionDate, sessionId]);

  const current = player.currentStep;
  const stepProgress = current ? Math.min(1, Math.max(0, (current.durationSec - player.remainingSeconds) / Math.max(1, current.durationSec))) : 0;

  if (!steps.length || !current) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-600">Training plan not found. Please run the programs seed SQL.</CardContent>
      </Card>
    );
  }

  if (progressLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-slate-600">Loading today&apos;s session progress...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {progressSyncError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{progressSyncError}</div>
      ) : null}
      <div className="grid gap-6 2xl:grid-cols-[270px_minmax(0,1fr)_320px]">
        <SessionFlow steps={steps} currentStepIndex={player.currentStepIndex} completedStepIds={player.completedStepIds} />

        <div className="order-1 min-w-0 space-y-5 2xl:order-2">
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
