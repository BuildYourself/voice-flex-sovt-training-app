"use client";

import { useCallback, useEffect, useState } from "react";
import { getCapColoursForOrder, getStoredCaps, getStoredKit, isVoiceFlexKit, setStoredKit, type CapColours, type VoiceFlexKit } from "@/lib/kits";
import { setOrderAsin } from "@/lib/review-request";
import { getIdentityRequestFields } from "@/lib/training-identity";
import { getActiveProduct, setActiveProduct, type VoiceFlexProduct } from "@/lib/training-product";
import {
  trainingProgressStore,
  type LocalTrainingProgress
} from "@/lib/training-progress";

function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

type ProgressApiPayload = {
  ok?: boolean;
  message?: string;
  currentDay?: number;
  kit?: string;
  sourceAsin?: string;
  stats?: {
    practiceStreak?: number;
    totalMinutes?: number;
    exercisesCompleted?: number;
    fullSessions?: number;
  };
};

type RemoteProgressStats = {
  practiceStreak: number;
  totalMinutes: number;
  exercisesCompleted: number;
  fullSessions: number;
  currentDay: number;
};

export function useTrainingProgress(initialProduct?: VoiceFlexProduct) {
  const [activeProduct, setActiveProductState] = useState<VoiceFlexProduct | null>(initialProduct ?? null);
  const [progress, setProgress] = useState<LocalTrainingProgress | null>(null);
  const [remoteStats, setRemoteStats] = useState<RemoteProgressStats | null>(null);
  const [progressStatsError, setProgressStatsError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [kit, setKitState] = useState<VoiceFlexKit | null>(null);
  const [caps, setCapsState] = useState<CapColours>("mono");

  useEffect(() => {
    const product = initialProduct ?? getActiveProduct();
    if (!product) {
      setHydrated(true);
      return;
    }

    setActiveProduct(product);
    setActiveProductState(product);
    setProgress(trainingProgressStore.getOrCreateProgress(product));
    setKitState(getStoredKit(product));
    setCapsState(getStoredCaps(product));
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

  const refreshProgressStats = useCallback(async () => {
    if (typeof window === "undefined" || !activeProduct) return null;

    const identity = getIdentityRequestFields(activeProduct);
    if (!identity) {
      setRemoteStats(null);
      setProgressStatsError(null);
      return null;
    }

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...identity,
          productType: activeProduct,
          today: localDateString()
        })
      });
      const payload = (await response.json().catch(() => null)) as ProgressApiPayload | null;

      if (!response.ok || !payload?.ok) {
        setProgressStatsError(payload?.message ?? "Could not load progress stats.");
        return null;
      }

      const nextStats: RemoteProgressStats = {
        practiceStreak: Number(payload.stats?.practiceStreak ?? 0),
        totalMinutes: Number(payload.stats?.totalMinutes ?? 0),
        exercisesCompleted: Number(payload.stats?.exercisesCompleted ?? 0),
        fullSessions: Number(payload.stats?.fullSessions ?? 0),
        currentDay: Number(payload.currentDay ?? 1)
      };

      setOrderAsin(activeProduct, payload.sourceAsin);
      if (isVoiceFlexKit(payload.kit)) {
        // The order's ASIN decides the kit.
        setStoredKit(activeProduct, payload.kit, "order", getCapColoursForOrder(payload.sourceAsin));
        setKitState(getStoredKit(activeProduct));
        setCapsState(getStoredCaps(activeProduct));
      }

      setRemoteStats(nextStats);
      setProgressStatsError(null);
      return nextStats;
    } catch {
      setProgressStatsError("Could not load progress stats.");
      return null;
    }
  }, [activeProduct]);

  useEffect(() => {
    void refreshProgressStats();
  }, [refreshProgressStats]);

  const effectiveProgress =
    progress && remoteStats
      ? {
          ...progress,
          currentDay: remoteStats.currentDay,
          streak: remoteStats.practiceStreak,
          totalMinutes: remoteStats.totalMinutes
        }
      : progress;

  return {
    activeProduct,
    kit: kit ?? (activeProduct ? getStoredKit(activeProduct) : null),
    caps,
    progress: effectiveProgress,
    /** Routines finished on this account, from the server. null until it answers. */
    routinesCompleted: remoteStats ? remoteStats.fullSessions : null,
    loading: !hydrated,
    hydrated,
    progressStatsError,
    refresh,
    refreshProgressStats,
    updateProgress,
    markOnboardingCompleted,
    resetProgress,
    markExerciseCompleted,
    addTrainingMinutes,
    updateStreakForToday
  };
}
