"use client";

import { useCallback, useEffect, useState } from "react";
import { getActiveProduct, setActiveProduct, type VoiceFlexProduct } from "@/lib/training-product";
import {
  trainingProgressStore,
  type LocalTrainingProgress
} from "@/lib/training-progress";

export function useTrainingProgress(initialProduct?: VoiceFlexProduct) {
  const [activeProduct, setActiveProductState] = useState<VoiceFlexProduct | null>(initialProduct ?? null);
  const [progress, setProgress] = useState<LocalTrainingProgress | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const product = initialProduct ?? getActiveProduct();
    if (!product) {
      setHydrated(true);
      return;
    }

    setActiveProduct(product);
    setActiveProductState(product);
    setProgress(trainingProgressStore.getOrCreateProgress(product));
    setHydrated(true);
  }, [initialProduct]);

  const refresh = useCallback((product: VoiceFlexProduct = activeProduct as VoiceFlexProduct) => {
    if (!product) return null;
    const nextProgress = trainingProgressStore.getOrCreateProgress(product);
    setProgress(nextProgress);
    return nextProgress;
  }, [activeProduct]);

  const updateProgress = useCallback(
    (partialUpdate: Partial<LocalTrainingProgress>) => {
      if (!activeProduct) return null;
      const nextProgress = trainingProgressStore.updateProgress(activeProduct, partialUpdate);
      setProgress(nextProgress);
      return nextProgress;
    },
    [activeProduct]
  );

  const markOnboardingCompleted = useCallback(() => {
    if (!activeProduct) return null;
    const nextProgress = trainingProgressStore.markOnboardingCompleted(activeProduct);
    setProgress(nextProgress);
    return nextProgress;
  }, [activeProduct]);

  const resetProgress = useCallback(() => {
    if (!activeProduct) return null;
    const nextProgress = trainingProgressStore.resetProgress(activeProduct);
    setProgress(nextProgress);
    return nextProgress;
  }, [activeProduct]);

  const markExerciseCompleted = useCallback(
    (dayKey: string, exerciseId: string) => {
      if (!activeProduct) return null;
      const nextProgress = trainingProgressStore.markExerciseCompleted(activeProduct, dayKey, exerciseId);
      setProgress(nextProgress);
      return nextProgress;
    },
    [activeProduct]
  );

  const addTrainingMinutes = useCallback(
    (minutes: number) => {
      if (!activeProduct) return null;
      const nextProgress = trainingProgressStore.addTrainingMinutes(activeProduct, minutes);
      setProgress(nextProgress);
      return nextProgress;
    },
    [activeProduct]
  );

  const updateStreakForToday = useCallback(() => {
    if (!activeProduct) return null;
    const nextProgress = trainingProgressStore.updateTrainingStreakForToday(activeProduct);
    setProgress(nextProgress);
    return nextProgress;
  }, [activeProduct]);

  return {
    activeProduct,
    progress,
    loading: !hydrated,
    hydrated,
    refresh,
    updateProgress,
    markOnboardingCompleted,
    resetProgress,
    markExerciseCompleted,
    addTrainingMinutes,
    updateStreakForToday
  };
}
