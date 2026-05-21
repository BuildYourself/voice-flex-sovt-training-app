"use client";

import { Check, Piano, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ResolvedSessionStep } from "@/lib/session/resolve-session";
import { cn } from "@/lib/utils";

export function SessionFlow({
  steps,
  currentStepIndex,
  completedStepIds
}: {
  steps: ResolvedSessionStep[];
  currentStepIndex: number;
  completedStepIds: string[];
}) {
  const hasPiano = steps.some((step) => step.requiresPiano);

  return (
    <Card className="order-2 hidden min-h-[820px] 2xl:order-1 2xl:block">
      <CardHeader>
        <CardTitle className="text-2xl">Session Flow</CardTitle>
        <span className="text-slate-600">{steps.length} Steps</span>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isCompleted = completedStepIds.includes(step.id);
          return (
            <div key={step.id} className={cn("relative grid grid-cols-[46px_1fr_auto] items-center gap-3 rounded-2xl p-3", isCurrent && "border border-electric-600 bg-blue-50")}>
              {index < steps.length - 1 && <span className="absolute left-[39px] top-14 h-14 border-l-2 border-dashed border-slate-300" />}
              <span className={cn("relative z-10 grid h-10 w-10 place-items-center rounded-full bg-slate-300 text-lg font-bold text-white", isCurrent && "bg-electric-600", isCompleted && "bg-emerald-500")}>
                {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
              </span>
              <div>
                <p className={cn("text-base font-black", isCurrent && "text-electric-700")}>{step.title}</p>
                <p className={cn("mt-1 text-sm text-slate-600", isCurrent && "font-bold text-electric-700")}>
                  {step.displayDuration}
                  {isCurrent ? " - Current" : ""}
                </p>
              </div>
              {step.requiresPiano && (
                <span className="grid h-7 w-7 place-items-center rounded-md border border-electric-200 text-electric-600">
                  <Piano className="h-4 w-4" />
                </span>
              )}
            </div>
          );
        })}
        <Button variant="outline" className="mt-9 w-full justify-between">
          View full plan <SkipForward className="h-4 w-4" />
        </Button>
        {hasPiano && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="flex items-center gap-2 font-bold text-electric-700">
              <Piano className="h-4 w-4" />
              Piano required
            </p>
            <p className="mt-1 text-slate-600">These exercises include piano accompaniment.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

