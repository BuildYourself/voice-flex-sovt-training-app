"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ResolvedSessionStep } from "@/lib/session/resolve-session";

export type SessionMode = "ready" | "demo" | "practice" | "paused" | "step-complete" | "session-complete";

export function useSessionPlayer({
  steps,
  onSessionComplete,
  onStepCompleted,
  persistedCompletedDurations = {}
}: {
  steps: ResolvedSessionStep[];
  onSessionComplete: (payload: { totalMinutes: number; stepsCompleted: number }) => Promise<void> | void;
  onStepCompleted?: (step: ResolvedSessionStep, stepIndex: number) => Promise<void> | void;
  persistedCompletedDurations?: Record<string, number>;
}) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [skippedStepIds, setSkippedStepIds] = useState<string[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(steps[0]?.durationSec ?? 0);
  const [mode, setMode] = useState<SessionMode>("ready");
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [isPracticeAudioPlaying, setIsPracticeAudioPlaying] = useState(false);

  const currentStep = steps[currentStepIndex];
  const totalSeconds = useMemo(() => steps.reduce((sum, step) => sum + step.durationSec, 0), [steps]);
  const timerRef = useRef<number | null>(null);
  const demoAudioRef = useRef<HTMLAudioElement | null>(null);
  const practiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const onSessionCompleteRef = useRef(onSessionComplete);
  const onStepCompletedRef = useRef(onStepCompleted);

  useEffect(() => {
    onSessionCompleteRef.current = onSessionComplete;
  }, [onSessionComplete]);

  useEffect(() => {
    onStepCompletedRef.current = onStepCompleted;
  }, [onStepCompleted]);

  useEffect(() => {
    if (!currentStep) return;
    console.log("[session-audio] current step", currentStep);
  }, [currentStep]);

  const completedSeconds = useMemo(() => {
    let sum = 0;
    for (let index = 0; index < steps.length; index += 1) {
      const step = steps[index];
      if (completedStepIds.includes(step.id)) {
        const key = `${step.exerciseId}:${index}`;
        sum += persistedCompletedDurations[key] ?? step.durationSec;
      }
    }
    return sum;
  }, [completedStepIds, persistedCompletedDurations, steps]);

  const elapsedPracticeSeconds = useMemo(() => {
    if (!currentStep) return completedSeconds;
    if (completedStepIds.includes(currentStep.id)) return completedSeconds;
    const practicedInCurrent = Math.max(0, currentStep.durationSec - remainingSeconds);
    return completedSeconds + practicedInCurrent;
  }, [completedSeconds, completedStepIds, currentStep, remainingSeconds]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopDemo = useCallback(() => {
    if (demoAudioRef.current) {
      demoAudioRef.current.pause();
      demoAudioRef.current.currentTime = 0;
    }
    setIsDemoPlaying(false);
    setMode((prev) => (prev === "demo" ? "ready" : prev));
  }, []);

  const stopPracticeAudio = useCallback(() => {
    if (practiceAudioRef.current) {
      practiceAudioRef.current.pause();
      practiceAudioRef.current.currentTime = 0;
    }
    setIsPracticeAudioPlaying(false);
  }, []);

  const cleanupAudio = useCallback(() => {
    stopDemo();
    stopPracticeAudio();
  }, [stopDemo, stopPracticeAudio]);

  const safePlayAudio = useCallback(
    async (url: string | null, kind: "demo" | "practice", context?: { stepId?: string; requiresPiano?: boolean }) => {
      if (!url) {
        console.warn(`[session] Missing ${kind} audio URL for this step.`);
        return false;
      }
      const normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith("/audio/session/")) {
        console.warn(`[session-audio] Invalid ${kind} audio path: ${normalizedUrl}`);
        return false;
      }

      let audio = kind === "demo" ? demoAudioRef.current : practiceAudioRef.current;
      if (!audio) {
        audio = new Audio();
        if (kind === "demo") {
          demoAudioRef.current = audio;
        } else {
          practiceAudioRef.current = audio;
        }
      }

      audio.preload = "auto";
      audio.loop = false;
      audio.pause();
      const nextSrc = new URL(normalizedUrl, window.location.origin).href;
      if (audio.src !== nextSrc) {
        audio.src = normalizedUrl;
      }
      audio.currentTime = 0;

      audio.onended = () => {
        audio!.currentTime = 0;
        if (kind === "demo") {
          setIsDemoPlaying(false);
          setMode((prev) => (prev === "demo" ? "ready" : prev));
        } else {
          setIsPracticeAudioPlaying(false);
        }
      };
      audio.onerror = () => {
        console.warn(`[session] ${kind} audio missing or failed to load: ${normalizedUrl}`);
        setAudioError(`${kind} audio missing`);
        if (kind === "demo") {
          setIsDemoPlaying(false);
          setMode((prev) => (prev === "demo" ? "ready" : prev));
        } else {
          setIsPracticeAudioPlaying(false);
        }
      };

      console.log("[session-audio] attempting play", {
        kind,
        stepId: context?.stepId,
        url: normalizedUrl,
        requiresPiano: context?.requiresPiano
      });

      try {
        await audio.play();
        if (kind === "demo") {
          setIsDemoPlaying(true);
        } else {
          setIsPracticeAudioPlaying(true);
        }
        console.log("[session-audio] play started", { kind, url: normalizedUrl });
        return true;
      } catch (error) {
        const serializedError =
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack
              }
            : error;
        console.warn("[session-audio] audio play failed", {
          kind,
          url: normalizedUrl,
          stepId: context?.stepId,
          serializedError,
          audioSrc: audio.src,
          currentSrc: audio.currentSrc,
          readyState: audio.readyState,
          networkState: audio.networkState,
          mediaError: audio.error
            ? {
                code: audio.error.code,
                message: audio.error.message
              }
            : null
        });
        setAudioError(`${kind} audio unavailable`);
        if (kind === "demo") {
          setIsDemoPlaying(false);
          setMode((prev) => (prev === "demo" ? "ready" : prev));
        } else {
          setIsPracticeAudioPlaying(false);
        }
        return false;
      }
    },
    []
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
    void Promise.resolve(onStepCompletedRef.current?.(currentStep, currentStepIndex)).catch((error) => {
      console.error("[session] Failed to sync completed step.", error);
    });
    stopTimer();
    stopPracticeAudio();
    if (currentStepIndex >= steps.length - 1) {
      setMode("session-complete");
      void Promise.resolve(onSessionCompleteRef.current({ totalMinutes: totalSeconds / 60, stepsCompleted: steps.length }));
      return;
    }
    setMode("step-complete");
    window.setTimeout(() => moveToStep(currentStepIndex + 1), 120);
  }, [currentStep, currentStepIndex, moveToStep, onSessionComplete, steps.length, stopPracticeAudio, stopTimer, totalSeconds]);

  useEffect(() => {
    if (mode !== "practice" || !currentStep) return;
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          stopTimer();
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
  }, [completeStep, currentStep, mode, stopTimer]);

  useEffect(() => {
    setRemainingSeconds(steps[currentStepIndex]?.durationSec ?? 0);
  }, [currentStepIndex, steps]);

  const playDemo = useCallback(async () => {
    if (!currentStep) return;
    console.log("[session-audio] play demo", currentStep.id, currentStep.demoAudioUrl);
    if (!currentStep.demoAudioUrl) {
      console.warn(`[session] Demo unavailable for step ${currentStep.title}`);
      return;
    }
    if (mode === "practice") return;
    setAudioError(null);
    if (isDemoPlaying || mode === "demo") {
      stopDemo();
      return;
    }
    stopPracticeAudio();
    const started = await safePlayAudio(currentStep.demoAudioUrl, "demo", {
      stepId: currentStep.id,
      requiresPiano: currentStep.requiresPiano
    });
    if (!started) {
      setMode("ready");
      return;
    }
    setMode("demo");
  }, [currentStep, isDemoPlaying, mode, safePlayAudio, stopDemo, stopPracticeAudio]);

  const startPractice = useCallback(async () => {
    if (!currentStep) return;
    console.log("[session-audio] start practice", currentStep.id, {
      requiresPiano: currentStep.requiresPiano,
      practiceAudioUrl: currentStep.practiceAudioUrl
    });
    setAudioError(null);
    stopDemo();
    if (currentStep.requiresPiano) {
      const started = await safePlayAudio(currentStep.practiceAudioUrl, "practice", {
        stepId: currentStep.id,
        requiresPiano: currentStep.requiresPiano
      });
      if (!started) {
        console.warn(`[session] practice audio unavailable for piano step ${currentStep.title}`);
      }
    } else {
      stopPracticeAudio();
    }
    setMode("practice");
  }, [currentStep, safePlayAudio, stopDemo, stopPracticeAudio]);

  const pausePractice = useCallback(() => {
    if (mode !== "practice") return;
    stopTimer();
    if (practiceAudioRef.current) practiceAudioRef.current.pause();
    setMode("paused");
  }, [mode, stopTimer]);

  const resumePractice = useCallback(async () => {
    if (!currentStep) return;
    if (mode !== "paused") return;
    setMode("practice");
    if (currentStep.requiresPiano && practiceAudioRef.current) {
      try {
        await practiceAudioRef.current.play();
        setIsPracticeAudioPlaying(true);
      } catch {
        console.warn("[session] practice resume blocked.");
      }
    }
  }, [currentStep, mode]);

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

  const hydrateProgress = useCallback(
    (completedStepKeys: string[]) => {
      const completedSet = new Set(completedStepKeys);
      const completedIds = steps
        .filter((step, index) => completedSet.has(`${step.exerciseId}:${index}`))
        .map((step) => step.id);

      setCompletedStepIds(completedIds);

      const firstUncompletedIndex = steps.findIndex((step, index) => !completedSet.has(`${step.exerciseId}:${index}`));

      if (firstUncompletedIndex === -1 && steps.length > 0) {
        setCurrentStepIndex(steps.length - 1);
        setRemainingSeconds(0);
        setMode("session-complete");
        return;
      }

      const targetIndex = Math.max(0, firstUncompletedIndex);
      setCurrentStepIndex(targetIndex);
      setRemainingSeconds(steps[targetIndex]?.durationSec ?? 0);
      setMode("ready");
      setAudioError(null);
    },
    [steps]
  );

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
    elapsedSeconds: elapsedPracticeSeconds,
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
    cleanupAudio,
    hydrateProgress
  };
}
