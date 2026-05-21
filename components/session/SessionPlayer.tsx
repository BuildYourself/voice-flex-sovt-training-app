"use client";

import { AlertTriangle, Check, CheckCircle2, Headphones, Pause, Piano, Play, SkipBack, SkipForward, Target, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SessionMode } from "@/hooks/useSessionPlayer";
import type { ResolvedSessionStep } from "@/lib/session/resolve-session";
import { cn } from "@/lib/utils";

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

export function SessionPlayer({
  step,
  stepIndex,
  totalSteps,
  mode,
  remainingSeconds,
  stepProgress,
  playDemo,
  stopDemo,
  startPractice,
  pausePractice,
  resumePractice,
  previousStep,
  skipStep,
  isDemoPlaying,
  isPracticeAudioPlaying
}: {
  step: ResolvedSessionStep;
  stepIndex: number;
  totalSteps: number;
  mode: SessionMode;
  remainingSeconds: number;
  stepProgress: number;
  playDemo: () => void;
  stopDemo: () => void;
  startPractice: () => void;
  pausePractice: () => void;
  resumePractice: () => void;
  previousStep: () => void;
  skipStep: () => void;
  isDemoPlaying: boolean;
  isPracticeAudioPlaying: boolean;
}) {
  const practicing = mode === "practice";
  const paused = mode === "paused";
  const canResume = paused;
  const demoUnavailable = !step.demoAudioUrl;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5 sm:p-7 xl:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-slate-700">
            <Waves className="h-7 w-7 text-electric-600 sm:h-8 sm:w-8" />
            <span className="text-base font-medium sm:text-lg">Current Exercise</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="rounded-lg bg-blue-100 px-3 py-2 text-sm font-bold text-electric-700 sm:px-4 sm:text-base">Step {stepIndex + 1} of {totalSteps}</span>
          </div>
        </div>

        <div className="mt-7 grid gap-8 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <h2 className="text-4xl font-black tracking-tight text-black sm:text-5xl">{step.title}</h2>
            <p className="mt-5 flex items-center gap-3 text-base text-slate-700 sm:text-lg">
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span>Tool: {step.tool}</span>
            </p>
            <p className="mt-5 max-w-[640px] text-base leading-7 text-slate-800 sm:text-lg sm:leading-8">{step.instructions}</p>

            <div className="mt-7 space-y-4">
              <div className="rounded-2xl border border-blue-200 bg-blue-50/45 p-5">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-electric-600">
                    <Headphones className="h-6 w-6" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[35px] font-black text-navy-950">1. Listen to Demo</p>
                    <p className="mt-1 text-slate-600">Hear how the exercise should sound before you begin.</p>
                    <div className="mt-4 flex items-center gap-4">
                      <Button
                        variant="outline"
                        disabled={demoUnavailable || mode === "practice"}
                        className="min-w-[138px] border-electric-300 text-electric-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={isDemoPlaying ? stopDemo : playDemo}
                      >
                        {isDemoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {isDemoPlaying ? "Stop Demo" : "Play Demo"}
                      </Button>
                      <span className="text-sm font-semibold text-slate-500">{demoUnavailable ? "Demo unavailable" : "Demo"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5">
                <div className="flex items-start gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-blue-100 text-electric-600">
                    {step.requiresPiano ? <Piano className="h-6 w-6" /> : <Target className="h-6 w-6" />}
                  </span>
                  <div className="flex-1">
                    <p className="text-[35px] font-black text-navy-950">{step.requiresPiano ? "2. Practice with Piano" : "2. Start Exercise"}</p>
                    <p className="mt-1 text-slate-600">{step.requiresPiano ? "Start the accompaniment and sing along for the full step." : "Start the timer and follow the exercise instructions."}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(190px,220px)_minmax(130px,155px)_minmax(130px,155px)]">
                      <Button className="h-11 bg-electric-600 text-white hover:bg-electric-700" onClick={canResume ? resumePractice : practicing ? pausePractice : startPractice}>
                        {practicing ? (
                          <>
                            <Pause className="h-4 w-4" />
                            Pause
                          </>
                        ) : canResume ? (
                          <>
                            <Play className="h-4 w-4" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            {step.requiresPiano ? "Start Practice" : "Start Exercise"}
                          </>
                        )}
                      </Button>
                      <Button variant="outline" className="h-11" onClick={previousStep}>
                        <SkipBack className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button variant="outline" className="h-11" onClick={skipStep}>
                        Skip Step
                        <SkipForward className="h-4 w-4" />
                      </Button>
                    </div>
                    {step.requiresPiano && (
                      <p className="mt-3 text-xs text-slate-500">
                        Accompaniment: {isPracticeAudioPlaying ? "Playing" : "Stopped"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid place-items-center">
            <div className="relative grid h-[238px] w-[238px] place-items-center rounded-full sm:h-[282px] sm:w-[282px]">
              <div className="absolute inset-0 rounded-full border-[18px] border-blue-100" />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#176bff ${stepProgress * 3.6}deg, transparent 0deg)`,
                  transform: "rotate(-90deg)",
                  transformOrigin: "50% 50%",
                  WebkitMask: "radial-gradient(circle, transparent 58%, #000 59%)",
                  mask: "radial-gradient(circle, transparent 58%, #000 59%)"
                }}
              />
              <div className="relative text-center">
                <p className="text-5xl font-black text-black sm:text-6xl">{formatClock(remainingSeconds)}</p>
                <p className="mt-3 text-slate-600">Remaining</p>
              </div>
            </div>
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Mode: {modeLabel(mode)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function HelperCards({ step }: { step: ResolvedSessionStep }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Card className="border border-emerald-100 bg-emerald-50/45">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-emerald-600" />
            <h3 className="text-xl font-black text-slate-950">What to do now</h3>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-700">{step.whatToDoNow}</p>
        </CardContent>
      </Card>

      <Card className="border border-blue-100 bg-blue-50/40">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-electric-600" />
            <h3 className="text-xl font-black text-slate-950">Tips</h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {step.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 text-electric-600" />
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border border-red-100 bg-red-50/45">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h3 className="text-xl font-black text-slate-950">Avoid</h3>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            {step.mistakes.map((mistake) => (
              <li key={mistake} className="flex gap-2">
                <span className="mt-0.5 text-red-500">✕</span>
                {mistake}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
