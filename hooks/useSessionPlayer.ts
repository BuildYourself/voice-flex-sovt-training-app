"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ResolvedSessionStep } from "@/lib/session/resolve-session";

export type SessionMode = "ready" | "demo" | "practice" | "paused" | "step-complete" | "session-complete";

function createOscillatorFallback(type: "demo" | "practice") {
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.gain.value = 0.04;
  gain.connect(ctx.destination);
  const osc = ctx.createOscillator();
  osc.type = type === "demo" ? "sine" : "triangle";
  osc.frequency.value = type === "demo" ? 660 : 262;
  osc.connect(gain);
  osc.start();
  const timer = window.setTimeout(() => {
    osc.stop();
    ctx.close().catch(() => {});
  }, type === "demo" ? 1600 : 2200);

  return () => {
    window.clearTimeout(timer);
    try {
      osc.stop();
    } catch {}
    ctx.close().catch(() => {});
  };
}

export function useSessionPlayer({
  steps,
  onSessionComplete
}: {
  steps: ResolvedSessionStep[];
  onSessionComplete: (payload: { totalMinutes: number; stepsCompleted: number }) => Promise<void> | void;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [skippedStepIds, setSkippedStepIds] = useState<string[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(steps[0]?.durationSec ?? 0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mode, setMode] = useState<SessionMode>("ready");
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [isPracticeAudioPlaying, setIsPracticeAudioPlaying] = useState(false);

  const currentStep = steps[currentStepIndex];
  const totalSeconds = useMemo(() => steps.reduce((sum, step) => sum + step.durationSec, 0), [steps]);
  const timerRef = useRef<number | null>(null);
  const demoAudioRef = useRef<HTMLAudioElement | null>(null);
  const practiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackStopRef = useRef<(() => void) | null>(null);
  const pausedFromRef = useRef<"demo" | "practice">("practice");

  const stopFallback = useCallback(() => {
    if (fallbackStopRef.current) {
      fallbackStopRef.current();
      fallbackStopRef.current = null;
    }
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopDemo = useCallback(() => {
    stopFallback();
    if (demoAudioRef.current) {
      demoAudioRef.current.pause();
      demoAudioRef.current.currentTime = 0;
      demoAudioRef.current.onended = null;
      demoAudioRef.current.onerror = null;
      demoAudioRef.current = null;
    }
    setIsDemoPlaying(false);
  }, [stopFallback]);

  const stopPracticeAudio = useCallback(() => {
    stopFallback();
    if (practiceAudioRef.current) {
      practiceAudioRef.current.pause();
      practiceAudioRef.current.currentTime = 0;
      practiceAudioRef.current.onended = null;
      practiceAudioRef.current.onerror = null;
      practiceAudioRef.current = null;
    }
    setIsPracticeAudioPlaying(false);
  }, [stopFallback]);

  const cleanupAudio = useCallback(() => {
    stopDemo();
    stopPracticeAudio();
  }, [stopDemo, stopPracticeAudio]);

  const safePlayAudio = useCallback(
    async (url: string | null, kind: "demo" | "practice") => {
      if (!url) {
        console.warn(`[session] Missing ${kind} audio URL for this step.`);
        return false;
      }
      try {
        const audio = new Audio(url);
        audio.loop = false;
        if (kind === "demo") {
          demoAudioRef.current = audio;
          setIsDemoPlaying(true);
        } else {
          practiceAudioRef.current = audio;
          setIsPracticeAudioPlaying(true);
        }
        audio.onended = () => {
          audio.currentTime = 0;
          if (kind === "demo") {
            setIsDemoPlaying(false);
            if (mode === "demo") setMode("ready");
          } else {
            setIsPracticeAudioPlaying(false);
          }
        };
        audio.onerror = () => {
          console.warn(`[session] ${kind} audio missing or failed to load: ${url}`);
          setAudioError(`${kind} audio missing`);
          if (kind === "demo") {
            setIsDemoPlaying(false);
            if (mode === "demo") setMode("ready");
          } else {
            setIsPracticeAudioPlaying(false);
          }
        };
        await audio.play();
        return true;
      } catch {
        console.warn(`[session] ${kind} audio blocked/failed, using WebAudio fallback.`);
        stopFallback();
        fallbackStopRef.current = createOscillatorFallback(kind);
        if (kind === "demo") setIsDemoPlaying(true);
        if (kind === "practice") setIsPracticeAudioPlaying(true);
        return true;
      }
    },
    [mode, stopFallback]
  );

  const moveToStep = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(index, steps.length - 1));
      stopTimer();
      cleanupAudio();
      setCurrentStepIndex(next);
      setRemainingSeconds(steps[next]?.durationSec ?? 0);
      setMode("ready");
      setAudioError(null);
    },
    [cleanupAudio, steps, stopTimer]
  );

  const completeStep = useCallback(() => {
    if (!currentStep) return;
    setCompletedStepIds((prev) => (prev.includes(currentStep.id) ? prev : [...prev, currentStep.id]));
    stopTimer();
    stopPracticeAudio();
    if (currentStepIndex >= steps.length - 1) {
      setMode("session-complete");
      void Promise.resolve(onSessionComplete({ totalMinutes: totalSeconds / 60, stepsCompleted: steps.length }));
      return;
    }
    setMode("step-complete");
    window.setTimeout(() => moveToStep(currentStepIndex + 1), 120);
  }, [currentStep, currentStepIndex, moveToStep, onSessionComplete, steps.length, stopPracticeAudio, stopTimer, totalSeconds]);

  useEffect(() => {
    if (mode !== "practice" || !currentStep) return;
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setElapsedSeconds((prev) => Math.min(totalSeconds, prev + 1));
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerRef.current!);
          timerRef.current = null;
          completeStep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [completeStep, currentStep, mode, stopTimer, totalSeconds]);

  useEffect(() => {
    setRemainingSeconds(steps[currentStepIndex]?.durationSec ?? 0);
  }, [currentStepIndex, steps]);

  const playDemo = useCallback(async () => {
    if (!currentStep) return;
    if (mode === "practice") return;
    setAudioError(null);
    if (isDemoPlaying || mode === "demo") {
      stopDemo();
      setMode("ready");
      return;
    }
    stopPracticeAudio();
    setMode("demo");
    await safePlayAudio(currentStep.demoAudioUrl, "demo");
  }, [currentStep, isDemoPlaying, mode, safePlayAudio, stopDemo, stopPracticeAudio]);

  const startPractice = useCallback(async () => {
    if (!currentStep) return;
    setAudioError(null);
    stopDemo();
    setMode("practice");
    if (currentStep.requiresPiano) {
      const started = await safePlayAudio(currentStep.practiceAudioUrl, "practice");
      if (!started && !currentStep.practiceAudioUrl) {
        console.warn(`[session] practiceAudioUrl missing for piano step ${currentStep.title}`);
      }
    } else {
      stopPracticeAudio();
    }
  }, [currentStep, safePlayAudio, stopDemo, stopPracticeAudio]);

  const pausePractice = useCallback(() => {
    pausedFromRef.current = mode === "demo" ? "demo" : "practice";
    stopTimer();
    if (demoAudioRef.current) demoAudioRef.current.pause();
    if (practiceAudioRef.current) practiceAudioRef.current.pause();
    setMode("paused");
  }, [mode, stopTimer]);

  const resumePractice = useCallback(async () => {
    if (!currentStep) return;
    if (pausedFromRef.current === "demo") {
      setMode("demo");
      if (demoAudioRef.current) {
        try {
          await demoAudioRef.current.play();
          setIsDemoPlaying(true);
        } catch {
          console.warn("[session] demo resume blocked.");
        }
      }
      return;
    }

    setMode("practice");
    if (currentStep.requiresPiano && practiceAudioRef.current) {
      try {
        await practiceAudioRef.current.play();
        setIsPracticeAudioPlaying(true);
      } catch {
        console.warn("[session] practice resume blocked.");
      }
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    moveToStep(currentStepIndex - 1);
  }, [currentStepIndex, moveToStep]);

  const nextStep = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      completeStep();
      return;
    }
    moveToStep(currentStepIndex + 1);
  }, [completeStep, currentStepIndex, moveToStep, steps.length]);

  const skipStep = useCallback(() => {
    if (!currentStep) return;
    cleanupAudio();
    stopTimer();
    setSkippedStepIds((prev) => (prev.includes(currentStep.id) ? prev : [...prev, currentStep.id]));
    nextStep();
  }, [cleanupAudio, currentStep, nextStep, stopTimer]);

  const resetStep = useCallback(() => {
    if (!currentStep) return;
    cleanupAudio();
    stopTimer();
    setRemainingSeconds(currentStep.durationSec);
    setMode("ready");
  }, [cleanupAudio, currentStep, stopTimer]);

  useEffect(() => {
    return () => {
      stopTimer();
      cleanupAudio();
    };
  }, [cleanupAudio, stopTimer]);

  return {
    currentStepIndex,
    currentStep,
    completedStepIds,
    skippedStepIds,
    remainingSeconds,
    elapsedSeconds,
    totalSeconds,
    mode,
    isDemoPlaying,
    isPracticeAudioPlaying,
    audioError,
    playDemo,
    stopDemo,
    startPractice,
    pausePractice,
    resumePractice,
    completeStep,
    skipStep,
    previousStep,
    nextStep,
    resetStep,
    cleanupAudio
  };
}

