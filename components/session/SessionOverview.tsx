"use client";

import { CheckCircle2, Piano, Star, Waves } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { SessionMode } from "@/hooks/useSessionPlayer";
import type { ResolvedSessionStep } from "@/lib/session/resolve-session";

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function modeLabel(mode: SessionMode) {
  switch (mode) {
    case "demo":
      return "Playing Demo";
    case "practice":
      return "Practicing";
    case "paused":
      return "Paused";
    case "step-complete":
      return "Step Complete";
    case "session-complete":
      return "Session Complete";
    default:
      return "Ready";
  }
}

export function SessionOverview({
  steps,
  currentStepIndex,
  completedCount,
  elapsedSeconds,
  totalSeconds,
  mode
}: {
  steps: ResolvedSessionStep[];
  currentStepIndex: number;
  completedCount: number;
  elapsedSeconds: number;
  totalSeconds: number;
  mode: SessionMode;
}) {
  const progress = totalSeconds ? Math.min(100, (elapsedSeconds / totalSeconds) * 100) : 0;
  const upcoming = steps.slice(currentStepIndex + 1);

  return (
    <div className="order-3 min-w-0 space-y-5">
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <span className="grid h-8 w-8 place-items-center rounded-full text-electric-700">
              <Waves className="h-8 w-8" />
            </span>
            <h3 className="text-2xl font-black">Session Overview</h3>
          </div>
          <p className="mt-9 text-slate-600">Total Length</p>
          <p className="mt-3 text-4xl font-black">
            {(totalSeconds / 60).toFixed(1)} <span className="text-xl">min</span>
          </p>
          <Progress value={progress} className="mt-8 h-4" indicatorClassName="bg-emerald-400" />
          <div className="mt-4 flex justify-between text-sm text-slate-500">
            <span>{formatClock(elapsedSeconds)} completed</span>
            <span>{formatClock(totalSeconds)} total</span>
          </div>
          <div className="mt-10 grid grid-cols-2 divide-x divide-slate-200 text-center">
            <div>
              <p className="flex items-center justify-center gap-2 text-2xl font-black">
                <CheckCircle2 className="h-7 w-7 text-electric-600" />
                {completedCount}
              </p>
              <p className="mt-2 text-slate-600">Steps Completed</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-2 text-2xl font-black">
                <Star className="h-7 w-7 text-amber-400" />
                0
              </p>
              <p className="mt-2 text-slate-600">Achievements</p>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-5">
            <p className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Current mode: {modeLabel(mode)}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="min-h-0 2xl:min-h-[530px]">
        <CardContent className="p-6 sm:p-8">
          <h3 className="text-2xl font-black">Up Next</h3>
          <p className="mt-1 text-slate-500">{upcoming.length} steps remaining</p>
          <div className="mt-7 space-y-7">
            {upcoming.map((step, index) => (
              <div key={step.id} className="flex items-center gap-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 font-bold text-slate-500">{currentStepIndex + index + 2}</span>
                <span className="flex-1 font-black">{step.title}</span>
                {step.requiresPiano && (
                  <span className="grid h-7 w-7 place-items-center rounded-md border border-electric-200 text-electric-600">
                    <Piano className="h-4 w-4" />
                  </span>
                )}
                <span className="text-slate-500">{step.displayDuration}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
