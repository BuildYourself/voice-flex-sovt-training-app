"use client";

import { voiceFlexProSession } from "@/lib/session-data";

const PROGRESS_KEY = "voiceflex_progress";
const SESSIONS_KEY = "voiceflex_sessions";

interface StoredProgress {
  currentProgram?: string;
  selectedProgram?: string;
  currentDay?: number;
  durationDays?: number;
  dayStreak?: number;
  totalMinutes?: number;
  sessionsCompleted?: number;
  completedDays?: number[];
  achievements?: string[];
  lastCompletedAt?: string;
}

function getStoredProgress(): Required<StoredProgress> {
  const fallback = {
    currentProgram: "21-Day Transformation Program",
    selectedProgram: "transformation-21",
    currentDay: 12,
    durationDays: 21,
    dayStreak: 12,
    totalMinutes: 245,
    sessionsCompleted: 18,
    completedDays: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11],
    achievements: ["first-step", "early-momentum", "consistent-streak", "halfway-hero"],
    lastCompletedAt: ""
  };

  try {
    const raw = window.localStorage.getItem(PROGRESS_KEY);
    return { ...fallback, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return fallback;
  }
}

function resolveAchievements(progress: Required<StoredProgress>) {
  const ids = new Set(progress.achievements);
  if (progress.sessionsCompleted >= 1) ids.add("first-step");
  if (progress.sessionsCompleted >= 5) ids.add("early-momentum");
  if (progress.dayStreak >= 7) ids.add("consistent-streak");
  if (progress.currentDay >= 10) ids.add("halfway-hero");
  if (progress.completedDays.includes(21) || progress.currentDay > 21) ids.add("point-b-reached");
  return Array.from(ids);
}

export function saveVoiceFlexProSession(stepsCompleted: number) {
  if (typeof window === "undefined") return;

  const progress = getStoredProgress();
  const day = Math.min(progress.currentDay, progress.durationDays);
  const nextProgress = {
    ...progress,
    sessionsCompleted: progress.sessionsCompleted + 1,
    totalMinutes: progress.totalMinutes + 10.5,
    dayStreak: progress.dayStreak + 1,
    currentDay: Math.min(progress.durationDays, day + 1),
    completedDays: Array.from(new Set([...progress.completedDays, day])).sort((a, b) => a - b),
    lastCompletedAt: new Date().toISOString()
  };
  nextProgress.achievements = resolveAchievements(nextProgress);

  const session = {
    id: crypto.randomUUID(),
    sessionName: voiceFlexProSession.displayName,
    completedAt: new Date().toISOString(),
    totalMinutes: 10.5,
    stepsCompleted,
    exercises: voiceFlexProSession.steps.map((step) => step.title)
  };

  let sessions: unknown[] = [];
  try {
    sessions = JSON.parse(window.localStorage.getItem(SESSIONS_KEY) || "[]");
    if (!Array.isArray(sessions)) sessions = [];
  } catch {
    sessions = [];
  }

  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(nextProgress));
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify([session, ...sessions]));
}
