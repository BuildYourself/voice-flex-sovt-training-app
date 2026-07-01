"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Eye,
  KeyboardMusic,
  Pause,
  Play,
  RotateCcw,
  Shield,
  SkipBack,
  SkipForward,
  Target,
  Waves
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTrainingProgress } from "@/hooks/use-training-progress";
import { cn } from "@/lib/utils";
import type { VoiceFlexProduct } from "@/lib/training-product";
import {
  formatSessionDuration,
  formatSessionTimer,
  getSessionTotalSeconds,
  getTrainingSessionConfig,
  type TrainingSessionExercise
} from "@/lib/training-sessions";

type SessionMode = "ready" | "practice" | "paused" | "complete";

const VERIFIED_ORDER_NUMBER_KEY = "voiceflex_verified_order_number";
const SHOW_DEV_RESET = process.env.NEXT_PUBLIC_SHOW_DEV_RESET === "true";

function getLocalDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function TrainingSession({ productType }: { productType: VoiceFlexProduct }) {
  const { progress, loading, markExerciseCompleted, addTrainingMinutes, updateProgress, updateStreakForToday, resetProgress } = useTrainingProgress(productType);
  const session = useMemo(() => getTrainingSessionConfig(productType), [productType]);
  const day = progress?.currentDay ?? session.day;
  const dayKey = `day-${day}`;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(session.exercises[0]?.durationSeconds ?? 0);
  const [mode, setMode] = useState<SessionMode>("ready");
  const [playingAudio, setPlayingAudio] = useState<"demo" | "accompaniment" | null>(null);
  const hydratedRef = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const demoAudioRef = useRef<HTMLAudioElement | null>(null);
  const accompanimentAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentStep = session.exercises[currentStepIndex] ?? session.exercises[0];
  const totalSeconds = useMemo(() => getSessionTotalSeconds(productType), [productType]);
  const completedSeconds = useMemo(
    () =>
      session.exercises.reduce((total, exercise) => {
        if (!completedIds.includes(exercise.id)) return total;
        return total + exercise.durationSeconds;
      }, 0),
    [completedIds, session.exercises]
  );
  const activeElapsed = mode === "practice" || mode === "paused" ? currentStep.durationSeconds - remainingSeconds : 0;
  const overviewSeconds = Math.min(totalSeconds, completedSeconds + Math.max(0, activeElapsed));
  const overviewPercent = totalSeconds ? Math.round((overviewSeconds / totalSeconds) * 100) : 0;
  const stepProgress = currentStep.durationSeconds ? (currentStep.durationSeconds - remainingSeconds) / currentStep.durationSeconds : 0;
  const safeStepProgress = Math.max(0, Math.min(1, stepProgress));
  const upcomingSteps = session.exercises.slice(currentStepIndex + 1);
  const allComplete = completedIds.length >= session.exercises.length;

  useEffect(() => {
    if (!progress || hydratedRef.current) return;
    const persistedCompleted = progress.completedExercises[dayKey] ?? [];
    const validCompleted = persistedCompleted.filter((id) => session.exercises.some((exercise) => exercise.id === id));
    const firstOpenIndex = session.exercises.findIndex((exercise) => !validCompleted.includes(exercise.id));

    setCompletedIds(validCompleted);
    setCurrentStepIndex(firstOpenIndex === -1 ? session.exercises.length - 1 : firstOpenIndex);
    setRemainingSeconds(session.exercises[firstOpenIndex === -1 ? session.exercises.length - 1 : firstOpenIndex]?.durationSeconds ?? 0);
    setMode(firstOpenIndex === -1 ? "complete" : "ready");
    hydratedRef.current = true;
  }, [dayKey, progress, session.exercises]);

  useEffect(() => {
    if (!hydratedRef.current || !currentStep) return;
    clearTimer();
    stopAllAudio();
    setRemainingSeconds(currentStep.durationSeconds);
    setMode(completedIds.length >= session.exercises.length ? "complete" : "ready");
  }, [currentStepIndex, currentStep, completedIds.length, session.exercises.length]);

  useEffect(() => {
    return () => {
      clearTimer();
      stopAllAudio();
    };
  }, []);

  function clearTimer() {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function stopAudio(kind: "demo" | "accompaniment") {
    const audio = kind === "demo" ? demoAudioRef.current : accompanimentAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    if (kind === "demo" && playingAudio === "demo") setPlayingAudio(null);
    if (kind === "accompaniment" && playingAudio === "accompaniment") setPlayingAudio(null);
  }

  function pauseAudio(kind: "demo" | "accompaniment") {
    const audio = kind === "demo" ? demoAudioRef.current : accompanimentAudioRef.current;
    if (!audio) return;
    audio.pause();
    if (kind === "demo" && playingAudio === "demo") setPlayingAudio(null);
    if (kind === "accompaniment" && playingAudio === "accompaniment") setPlayingAudio(null);
  }

  function stopAllAudio() {
    const demoAudio = demoAudioRef.current;
    if (demoAudio) {
      demoAudio.pause();
      demoAudio.currentTime = 0;
    }

    const accompanimentAudio = accompanimentAudioRef.current;
    if (accompanimentAudio) {
      accompanimentAudio.pause();
      accompanimentAudio.currentTime = 0;
    }

    setPlayingAudio(null);
  }

  async function playAudio(kind: "demo" | "accompaniment", url: string) {
    if (!url) return false;

    stopAudio(kind === "demo" ? "accompaniment" : "demo");

    const audioRef = kind === "demo" ? demoAudioRef : accompanimentAudioRef;
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;
    const nextSrc = new URL(url, window.location.origin).href;
    audio.pause();
    if (audio.src !== nextSrc) {
      audio.src = url;
    }
    audio.preload = "auto";
    audio.loop = false;
    audio.currentTime = 0;
    audio.onended = () => {
      audio.currentTime = 0;
      setPlayingAudio(null);
    };
    audio.onerror = () => {
      console.warn("[train-audio] audio unavailable", {
        kind,
        url,
        code: audio.error?.code,
        message: audio.error?.message,
        src: audio.src,
        currentSrc: audio.currentSrc
      });
      setPlayingAudio(null);
    };

    try {
      await audio.play();
      setPlayingAudio(kind);
      return true;
    } catch (error) {
      console.warn("[train-audio] audio play failed", {
        kind,
        url,
        error: error instanceof Error ? { name: error.name, message: error.message } : String(error),
        src: audio.src,
        currentSrc: audio.currentSrc,
        readyState: audio.readyState,
        networkState: audio.networkState
      });
      setPlayingAudio(null);
      return false;
    }
  }

  async function resumeAudio(kind: "demo" | "accompaniment", url: string) {
    const audio = kind === "demo" ? demoAudioRef.current : accompanimentAudioRef.current;
    if (!audio || audio.ended || audio.currentTime <= 0) {
      return playAudio(kind, url);
    }

    try {
      audio.loop = false;
      await audio.play();
      setPlayingAudio(kind);
      return true;
    } catch (error) {
      console.warn("[train-audio] audio resume failed", {
        kind,
        url,
        error: error instanceof Error ? { name: error.name, message: error.message } : String(error)
      });
      setPlayingAudio(null);
      return false;
    }
  }

  function toggleDemoAudio(step: TrainingSessionExercise) {
    if (mode === "practice") return;
    if (!step.demoAudioSrc) return;
    if (playingAudio === "demo") {
      stopAudio("demo");
      return;
    }
    void playAudio("demo", step.demoAudioSrc);
  }

  async function syncCompletedExercise(step: TrainingSessionExercise) {
    const orderNumber = window.localStorage.getItem(VERIFIED_ORDER_NUMBER_KEY);

    if (!orderNumber) {
      console.warn("[training-session] Skipping remote progress sync because no verified order is stored.");
      return;
    }

    try {
      const response = await fetch("/api/progress/complete-exercise", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          orderNumber,
          productType,
          programDay: day,
          exerciseId: step.id,
          exerciseTitle: step.title,
          durationSeconds: step.durationSeconds,
          totalExercises: session.exercises.length,
          practiceDate: getLocalDateString()
        })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        console.warn("[training-session] Progress sync failed.", payload ?? { status: response.status });
      }
    } catch (error) {
      console.warn("[training-session] Progress sync failed.", error);
    }
  }

  function completeStep(step: TrainingSessionExercise) {
    clearTimer();
    stopAllAudio();
    setCompletedIds((current) => {
      if (current.includes(step.id)) return current;

      const nextCompleted = Array.from(new Set([...current, step.id]));
      const nextIndex = session.exercises.findIndex((exercise) => !nextCompleted.includes(exercise.id));
      const isSessionComplete = nextCompleted.length >= session.exercises.length;

      void syncCompletedExercise(step);
      markExerciseCompleted(dayKey, step.id);
      addTrainingMinutes(Math.round((step.durationSeconds / 60) * 10) / 10);
      updateStreakForToday();

      if (isSessionComplete && progress) {
        updateProgress({
          completedDays: Array.from(new Set([...progress.completedDays, day]))
        });
      }

      if (isSessionComplete || nextIndex === -1) {
        setMode("complete");
      } else {
        setCurrentStepIndex(nextIndex);
        setMode("ready");
      }

      return nextCompleted;
    });
  }

  function startTimer() {
    if (mode === "complete") return;
    clearTimer();
    setMode("practice");
    intervalRef.current = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          completeStep(currentStep);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
  }

  function pauseTimer() {
    clearTimer();
    pauseAudio("accompaniment");
    setMode("paused");
  }

  function handlePracticeClick() {
    if (mode === "practice") {
      pauseTimer();
      return;
    }

    stopAudio("demo");
    if (currentStep.accompanimentAudioSrc) {
      if (mode === "paused") {
        void resumeAudio("accompaniment", currentStep.accompanimentAudioSrc);
      } else {
        void playAudio("accompaniment", currentStep.accompanimentAudioSrc);
      }
    }
    startTimer();
  }

  function skipStep() {
    clearTimer();
    stopAllAudio();
    const nextIndex = Math.min(session.exercises.length - 1, currentStepIndex + 1);
    setCurrentStepIndex(nextIndex);
    setRemainingSeconds(session.exercises[nextIndex]?.durationSeconds ?? 0);
    setMode("ready");
  }

  function previousStep() {
    clearTimer();
    stopAllAudio();
    const previousIndex = Math.max(0, currentStepIndex - 1);
    setCurrentStepIndex(previousIndex);
    setRemainingSeconds(session.exercises[previousIndex]?.durationSeconds ?? 0);
    setMode("ready");
  }

  if (loading || !progress) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f6f9fd] px-4 text-navy-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 font-black shadow-card">Loading your session...</div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f9fd] text-navy-950">
      <TrainingSidebar
        productType={productType}
        onRestartSetup={() => {
          updateProgress({ onboardingCompleted: false });
          window.location.reload();
        }}
        onResetProgress={() => {
          resetProgress();
          window.location.reload();
        }}
      />

      <main className="px-4 py-6 sm:px-6 lg:ml-[272px] lg:px-8">
        <div className="mx-auto max-w-[1680px]">
          <header className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <h1 className="text-[32px] font-black leading-tight tracking-normal text-black md:text-[38px]">{session.title}</h1>
              <p className="mt-2 text-base leading-7 text-slate-600 md:text-lg">{session.subtitle}</p>
            </div>
            <div className="flex flex-col items-start gap-3 xl:items-end">
              <div className="flex items-center gap-5 text-sm text-slate-700">
                <TopMetric icon="fire" value={progress.streak} label="day streak" />
                <div className="h-8 w-px bg-slate-200" />
                <TopMetric icon="timer" value={progress.totalMinutes} label="total minutes" />
              </div>
              <div className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-black text-electric-700">
                From Point A to Point B - one guided step at a time.
              </div>
            </div>
          </header>

          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_330px]">
            <SessionFlow
              steps={session.exercises}
              currentStepIndex={currentStepIndex}
              completedIds={completedIds}
            />

            <section className="space-y-5">
              <Card className="overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_230px]">
                    <div>
                      <div className="mb-7 flex items-center gap-4">
                        <Waves className="h-8 w-8 text-electric-700" />
                        <span className="font-bold text-slate-600">Current Exercise</span>
                      </div>
                      <h2 className="text-[34px] font-black leading-tight tracking-normal text-black md:text-[48px]">{currentStep.title}</h2>
                      <p className="mt-4 flex items-center gap-2 text-base text-slate-700">
                        <span className="h-3 w-3 rounded-full bg-amber-400" />
                        Tool: {currentStep.tool ?? "Voice Flex"}
                      </p>
                      <p className="mt-5 max-w-3xl text-base leading-8 text-slate-700">{currentStep.description}</p>
                    </div>

                    <div className="flex flex-col items-center justify-start gap-3 pt-2">
                      <span className="self-end rounded-lg bg-blue-100 px-4 py-2 text-sm font-black text-electric-700">
                        Step {currentStepIndex + 1} of {session.exercises.length}
                      </span>
                      <TimerRing progress={safeStepProgress} remainingSeconds={remainingSeconds} />
                    </div>
                  </div>

                  <WatchDemoCard currentStep={currentStep} playingAudio={playingAudio} demoDisabled={mode === "practice"} onToggleDemo={toggleDemoAudio} />

                  <div className="mt-4 rounded-3xl border border-blue-200 bg-blue-50/40 p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex gap-4">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-100 text-electric-700">
                          {currentStep.accompanimentAudioSrc ? <KeyboardMusic className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                        </span>
                        <div>
                          <h3 className="text-[28px] font-black leading-tight text-black">2. {currentStep.accompanimentAudioSrc ? "Practice with Piano" : "Start Exercise"}</h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {currentStep.accompanimentAudioSrc ? "Start the accompaniment and sing along for the full step." : "Start the timer and follow the exercise instructions."}
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-700">
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                        Mode: {mode === "practice" ? "Practicing" : mode === "paused" ? "Paused" : mode === "complete" ? "Session Complete" : "Ready"}
                      </span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3 pl-0 lg:pl-[60px]">
                      <Button className="h-12 min-w-[190px] rounded-xl font-black" onClick={handlePracticeClick} disabled={allComplete}>
                        {mode === "practice" ? <Pause className="mr-2 h-4 w-4 fill-current" /> : <Play className="mr-2 h-4 w-4 fill-current" />}
                        {mode === "practice" ? "Pause" : mode === "paused" ? "Resume" : currentStep.accompanimentAudioSrc ? "Start Practice" : "Start Exercise"}
                      </Button>
                      <Button variant="outline" className="h-12 min-w-[130px] rounded-xl border-slate-200 font-black" onClick={previousStep} disabled={currentStepIndex === 0}>
                        <SkipBack className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <Button variant="outline" className="h-12 min-w-[130px] rounded-xl border-slate-200 font-black text-electric-700" onClick={skipStep} disabled={currentStepIndex >= session.exercises.length - 1}>
                        Skip Step
                        <SkipForward className="ml-2 h-4 w-4" />
                      </Button>
                      {currentStep.accompanimentAudioSrc ? (
                        <p className="w-full text-xs font-semibold text-slate-500">
                          Accompaniment: {playingAudio === "accompaniment" ? "Playing" : "Stopped"}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-5 md:grid-cols-3">
                <HelperCard icon={<Target className="h-6 w-6" />} title="What to do now" text={currentStep.whatToDoNow} tone="green" />
                <HelperList icon={<CheckCircle2 className="h-6 w-6" />} title="Tips" items={currentStep.tips} tone="blue" />
                <HelperList icon={<AlertTriangle className="h-6 w-6" />} title="Avoid" items={currentStep.avoid} tone="red" />
              </div>
            </section>

            <aside className="space-y-6">
              <Card>
                <CardContent className="p-7">
                  <div className="flex items-start gap-4">
                    <Waves className="h-8 w-8 text-electric-700" />
                    <h2 className="text-2xl font-black text-black">Session Overview</h2>
                  </div>
                  <p className="mt-8 text-sm text-slate-600">Total Length</p>
                  <p className="mt-2 text-4xl font-black text-black">
                    {formatSessionDuration(totalSeconds).replace(" min", "")}
                    <span className="ml-2 text-xl">min</span>
                  </p>
                  <div className="mt-8 h-3 rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-emerald-400" style={{ width: `${overviewPercent}%` }} />
                  </div>
                  <div className="mt-4 flex justify-between text-xs font-medium text-slate-500">
                    <span>{formatSessionTimer(overviewSeconds)} completed</span>
                    <span>{formatSessionTimer(totalSeconds)} total</span>
                  </div>
                  <div className="mt-8 grid grid-cols-2 divide-x divide-slate-200 text-center">
                    <div>
                      <p className="text-3xl font-black text-black">{completedIds.length}</p>
                      <p className="mt-1 text-sm text-slate-600">Steps Completed</p>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-black">0</p>
                      <p className="mt-1 text-sm text-slate-600">Achievements</p>
                    </div>
                  </div>
                  <div className="mt-7 border-t border-slate-200 pt-5 text-sm text-slate-600">
                    <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                    Current mode: {mode === "practice" ? "Practicing" : mode === "paused" ? "Paused" : mode === "complete" ? "Session Complete" : "Ready"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-7">
                  <h2 className="text-2xl font-black text-black">Up Next</h2>
                  <p className="mt-2 text-sm text-slate-500">{upcomingSteps.length} steps remaining</p>
                  <div className="mt-7 space-y-5">
                    {upcomingSteps.map((step) => (
                      <div key={step.id} className="flex items-center gap-4">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-200 text-sm font-black text-slate-600">
                          {session.exercises.findIndex((exercise) => exercise.id === step.id) + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-black text-black">{step.title}</p>
                            {step.requiresPiano && <KeyboardMusic className="h-4 w-4 text-electric-700" />}
                          </div>
                        </div>
                        <span className="text-sm text-slate-500">{formatSessionDuration(step.durationSeconds)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-sm text-slate-700">
            <Shield className="mr-3 inline h-5 w-5 text-amber-500" />
            <span className="font-black text-navy-950">Safety Note:</span> If you feel pain, discomfort, dizziness, or scratchiness, stop and rest. These exercises should feel easy and relaxed.
          </div>
        </div>
      </main>
    </div>
  );
}

function TrainingSidebar({
  productType,
  onRestartSetup,
  onResetProgress
}: {
  productType: VoiceFlexProduct;
  onRestartSetup: () => void;
  onResetProgress: () => void;
}) {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[272px] bg-navy-950 px-5 py-8 text-white lg:flex lg:flex-col">
      <div className="flex items-center gap-3 text-2xl font-black">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-cyan-300">
          <Waves className="h-7 w-7" />
        </span>
        Voice Flex
      </div>
      <nav className="mt-10 space-y-2">
        <div className="rounded-2xl px-4 py-4 font-bold text-white/75">🚀 Setup</div>
        <div className="rounded-2xl bg-electric-600 px-4 py-4 font-black">🎙️ Sessions</div>
        <Link className="block rounded-2xl px-4 py-4 font-bold text-white/75 hover:bg-white/10" href={`/train/${productType}/progress`}>
          📊 Progress
        </Link>
        <div className="rounded-2xl px-4 py-4 font-bold text-white/75">⚙️ Settings</div>
      </nav>
      <div className="mt-auto rounded-3xl border border-white/10 bg-white/5 p-5 text-sm leading-6 text-white/75">
        <p className="font-black text-white">{productType === "pro" ? "Voice Flex Pro" : "Voice Flex GO"}</p>
        <p className="mt-2">No account required. Progress saved on this device.</p>
        <div className="mt-4 grid gap-2">
          <button className="rounded-xl border border-white/15 px-3 py-2 text-left text-xs font-black text-white/85 hover:bg-white/10" type="button" onClick={onRestartSetup}>
            Restart setup
          </button>
          {SHOW_DEV_RESET ? (
            <button className="rounded-xl border border-white/15 px-3 py-2 text-left text-xs font-black text-white/85 hover:bg-white/10" type="button" onClick={onResetProgress}>
              <RotateCcw className="mr-2 inline h-3.5 w-3.5" />
              Reset local progress
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function TopMetric({ icon, value, label }: { icon: "fire" | "timer"; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl">{icon === "fire" ? "🔥" : "⏱️"}</span>
      <span>
        <span className="block text-lg font-black text-black">{value}</span>
        <span className="text-xs text-slate-500">{label}</span>
      </span>
    </div>
  );
}

function SessionFlow({
  steps,
  currentStepIndex,
  completedIds
}: {
  steps: TrainingSessionExercise[];
  currentStepIndex: number;
  completedIds: string[];
}) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="mb-7 flex items-center justify-between">
          <h2 className="text-2xl font-black text-black">Session Flow</h2>
          <span className="text-sm text-slate-500">{steps.length} Steps</span>
        </div>
        <div className="space-y-5">
          {steps.map((step, index) => {
            const isCompleted = completedIds.includes(step.id);
            const isActive = index === currentStepIndex && !isCompleted;
            return (
              <div
                key={step.id}
                className={cn(
                  "relative flex items-center gap-4 rounded-2xl border px-4 py-3",
                  isActive ? "border-electric-600 bg-blue-50" : "border-transparent"
                )}
              >
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black",
                    isCompleted && "bg-emerald-500 text-white",
                    isActive && "bg-electric-600 text-white",
                    !isCompleted && !isActive && "bg-slate-200 text-slate-500"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={cn("truncate font-black", isActive ? "text-electric-700" : "text-black")}>{step.title}</p>
                    {step.requiresPiano && <KeyboardMusic className="h-4 w-4 shrink-0 text-electric-700" />}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatSessionDuration(step.durationSeconds)}
                    {isActive ? " - Current" : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {steps.some((step) => step.requiresPiano) && (
          <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-slate-600">
            <p className="flex items-center gap-2 font-black text-electric-700">
              <KeyboardMusic className="h-4 w-4" />
              Piano required
            </p>
            <p className="mt-1">These exercises include piano guidance.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TimerRing({ progress, remainingSeconds }: { progress: number; remainingSeconds: number }) {
  const radius = 76;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="relative h-[190px] w-[190px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="#dbeafe" strokeWidth="10" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#1d6df2"
          strokeLinecap="round"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="text-4xl font-black text-black">{formatSessionTimer(remainingSeconds)}</p>
          <p className="mt-1 text-sm text-slate-500">Remaining</p>
        </div>
      </div>
    </div>
  );
}

function WatchDemoCard({
  currentStep,
  playingAudio,
  demoDisabled,
  onToggleDemo
}: {
  currentStep: TrainingSessionExercise;
  playingAudio: "demo" | "accompaniment" | null;
  demoDisabled: boolean;
  onToggleDemo: (step: TrainingSessionExercise) => void;
}) {
  const hasVisualDemo = Boolean(currentStep.demoSteps?.length);
  const hasAudioDemo = Boolean(currentStep.demoAudioSrc);

  return (
    <div className="mt-7 rounded-3xl border border-blue-200 bg-blue-50/30 p-5">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-100 text-electric-700">
          {hasAudioDemo && !hasVisualDemo ? <KeyboardMusic className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[28px] font-black leading-tight text-black">1. {hasVisualDemo ? "Watch Demo" : "Listen to Demo"}</h3>
          <p className="mt-1 text-sm text-slate-600">
            {hasVisualDemo ? "See how to set up and perform the exercise before you begin." : "Hear how the exercise should sound before you begin."}
          </p>
        </div>
      </div>

      {hasVisualDemo ? (
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {currentStep.demoSteps?.map((step, index) => (
            <div key={`${currentStep.id}-${step.title}`} className="rounded-2xl border border-blue-200 bg-white p-4 text-center">
              <h4 className="font-black text-black">{step.title}</h4>
              <p className="text-sm font-black text-black">{step.subtitle}</p>
              <div className="relative mt-4 overflow-hidden rounded-2xl bg-slate-50">
                {step.imageSrc ? <img src={step.imageSrc} alt={`${currentStep.title} ${step.subtitle}`} className="h-36 w-full object-contain" /> : null}
                <span className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-electric-600 text-sm font-black text-white">{index + 1}</span>
              </div>
              <ul className="mt-4 space-y-2 rounded-2xl bg-blue-50 p-3 text-left text-xs font-semibold leading-5 text-navy-950">
                {step.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-electric-700" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : hasAudioDemo ? (
        <div className="mt-5 flex flex-wrap items-center gap-4 pl-0 md:pl-[58px]">
          <Button
            variant="outline"
            className="h-12 rounded-xl border-blue-200 px-7 font-black text-electric-700"
            type="button"
            disabled={demoDisabled}
            onClick={() => onToggleDemo(currentStep)}
          >
            {playingAudio === "demo" ? <Pause className="mr-2 h-4 w-4 fill-current" /> : <Play className="mr-2 h-4 w-4 fill-current" />}
            {playingAudio === "demo" ? "Pause Demo" : "Play Demo"}
          </Button>
          <span className="text-sm font-semibold text-slate-500">Demo</span>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-5 text-sm font-semibold text-slate-600">
          Visual demo coming soon. Start the exercise when you are ready and keep everything relaxed.
        </div>
      )}
    </div>
  );
}

function HelperCard({ icon, title, text, tone }: { icon: ReactNode; title: string; text: string; tone: "green" | "blue" | "red" }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className={cn("mb-4 flex items-center gap-3 text-xl font-black text-black", tone === "green" && "text-emerald-700", tone === "blue" && "text-electric-700", tone === "red" && "text-red-600")}>
          {icon}
          <h3 className="text-black">{title}</h3>
        </div>
        <p className="text-sm leading-7 text-slate-600">{text}</p>
      </CardContent>
    </Card>
  );
}

function HelperList({ icon, title, items, tone }: { icon: ReactNode; title: string; items: string[]; tone: "green" | "blue" | "red" }) {
  const isAvoid = tone === "red";
  return (
    <Card>
      <CardContent className="p-6">
        <div className={cn("mb-4 flex items-center gap-3 text-xl font-black", isAvoid ? "text-red-600" : "text-electric-700")}>
          {icon}
          <h3 className="text-black">{title}</h3>
        </div>
        <ul className="space-y-2 text-sm leading-6 text-slate-600">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              {isAvoid ? <span className="text-red-500">x</span> : <Check className="mt-1 h-4 w-4 shrink-0 text-electric-700" />}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
