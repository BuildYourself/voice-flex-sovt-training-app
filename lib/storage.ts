"use client";

import { calendarDays, demoUser, journalEntries, todayExercises } from "@/lib/mock-data";
import type { CalendarDay, JournalEntry } from "@/lib/types";

export const AUTH_KEY = "voiceflex_auth";
export const PROGRESS_KEY = "voiceflex_progress";
export const SESSIONS_KEY = "voiceflex_sessions";
export const JOURNAL_KEY = "voiceflex_journal";
export const SETTINGS_KEY = "voiceflex_settings";

export interface VoiceFlexAuth {
  isLoggedIn: boolean;
  user: {
    name: string;
    email: string;
    plan: string;
  };
}

export interface VoiceFlexProgress {
  currentProgram: string;
  selectedProgram: string;
  currentDay: number;
  durationDays: number;
  dayStreak: number;
  totalMinutes: number;
  sessionsCompleted: number;
  completedDays: number[];
  achievements: string[];
  lastCompletedAt?: string;
}

export interface VoiceFlexSession {
  id: string;
  programId: string;
  day: number;
  completedAt: string;
  totalMinutes: number;
  exercises: string[];
  note?: string;
}

export interface VoiceFlexSettings {
  displayName: string;
  preferredGoal: "Singing" | "Speaking" | "Recovery" | "Range";
  reminders: boolean;
  dailyTrainingTime: string;
}

export const defaultProgress: VoiceFlexProgress = {
  currentProgram: "21-Day Transformation Program",
  selectedProgram: "transformation-21",
  currentDay: 12,
  durationDays: 21,
  dayStreak: 12,
  totalMinutes: 245,
  sessionsCompleted: 18,
  completedDays: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11],
  achievements: ["first-step", "early-momentum", "consistent-streak", "halfway-hero"],
  lastCompletedAt: undefined
};

export const defaultSettings: VoiceFlexSettings = {
  displayName: demoUser.displayName,
  preferredGoal: "Singing",
  reminders: true,
  dailyTrainingTime: "08:00"
};

const defaultSessions: VoiceFlexSession[] = [
  {
    id: "demo-session-11",
    programId: "transformation-21",
    day: 11,
    completedAt: new Date("2026-05-18T08:30:00").toISOString(),
    totalMinutes: 33,
    exercises: todayExercises.map((exercise) => exercise.title),
    note: "Tone felt easier after lip trills."
  }
];

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return { ...fallback, ...JSON.parse(value) } as T;
  } catch {
    return fallback;
  }
}

function safeParseArray<T>(value: string | null, fallback: T[]): T[] {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function getAuth(): VoiceFlexAuth | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const auth = JSON.parse(raw) as VoiceFlexAuth;
    return auth?.isLoggedIn ? auth : null;
  } catch {
    return null;
  }
}

export function setAuth(auth: VoiceFlexAuth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function logout() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_KEY);
}

export function getProgress(): VoiceFlexProgress {
  if (typeof window === "undefined") return defaultProgress;
  const stored = safeParse<VoiceFlexProgress>(window.localStorage.getItem(PROGRESS_KEY), defaultProgress);
  const progress = {
    ...defaultProgress,
    ...stored,
    completedDays: Array.isArray(stored.completedDays) ? stored.completedDays : defaultProgress.completedDays,
    achievements: Array.isArray(stored.achievements) ? stored.achievements : defaultProgress.achievements
  };
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  return progress;
}

export function setProgress(progress: VoiceFlexProgress) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getSessions(): VoiceFlexSession[] {
  if (typeof window === "undefined") return defaultSessions;
  const sessions = safeParseArray<VoiceFlexSession>(window.localStorage.getItem(SESSIONS_KEY), defaultSessions);
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  return sessions;
}

export function getJournalEntries(): JournalEntry[] {
  if (typeof window === "undefined") return journalEntries;
  const entries = safeParseArray<JournalEntry>(window.localStorage.getItem(JOURNAL_KEY), journalEntries);
  window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  return entries;
}

export function addJournalEntry(body: string, title = body): JournalEntry {
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    title,
    body,
    mood: "Focused",
    createdAt: new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
  };
  const entries = [entry, ...getJournalEntries()];
  window.localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  return entry;
}

export function getSettings(): VoiceFlexSettings {
  if (typeof window === "undefined") return defaultSettings;
  const settings = safeParse<VoiceFlexSettings>(window.localStorage.getItem(SETTINGS_KEY), defaultSettings);
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  return settings;
}

export function setSettings(settings: VoiceFlexSettings) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function resolveAchievements(progress: VoiceFlexProgress) {
  const ids = new Set(progress.achievements);
  if (progress.sessionsCompleted >= 1) ids.add("first-step");
  if (progress.sessionsCompleted >= 5) ids.add("early-momentum");
  if (progress.dayStreak >= 7) ids.add("consistent-streak");
  if (progress.currentDay >= 10) ids.add("halfway-hero");
  if (progress.completedDays.includes(21) || progress.currentDay > 21) ids.add("point-b-reached");
  return Array.from(ids);
}

export function completeSession(minutes: number, exercises: string[], note?: string) {
  const progress = getProgress();
  const day = Math.min(progress.currentDay, progress.durationDays);
  const completedDays = Array.from(new Set([...progress.completedDays, day])).sort((a, b) => a - b);
  const nextProgress: VoiceFlexProgress = {
    ...progress,
    currentDay: Math.min(progress.durationDays, day + 1),
    totalMinutes: progress.totalMinutes + minutes,
    sessionsCompleted: progress.sessionsCompleted + 1,
    dayStreak: progress.dayStreak + 1,
    completedDays,
    lastCompletedAt: new Date().toISOString()
  };
  nextProgress.achievements = resolveAchievements(nextProgress);

  const session: VoiceFlexSession = {
    id: crypto.randomUUID(),
    programId: progress.selectedProgram,
    day,
    completedAt: new Date().toISOString(),
    totalMinutes: minutes,
    exercises,
    note
  };

  setProgress(nextProgress);
  window.localStorage.setItem(SESSIONS_KEY, JSON.stringify([session, ...getSessions()]));
  return { progress: nextProgress, session };
}

export function resetDemoData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROGRESS_KEY);
  window.localStorage.removeItem(SESSIONS_KEY);
  window.localStorage.removeItem(JOURNAL_KEY);
  window.localStorage.removeItem(SETTINGS_KEY);
  getProgress();
  getSessions();
  getJournalEntries();
  getSettings();
}

export function getCalendarDays(): CalendarDay[] {
  const progress = getProgress();
  const sessions = getSessions();
  const journal = getJournalEntries();
  return calendarDays.map((day) => {
    if (!day.day) return day;
    const session = sessions.find((item) => item.day === day.day);
    const status = progress.completedDays.includes(day.day)
      ? "completed"
      : day.day === progress.currentDay
        ? "today"
        : day.status === "milestone" || [14, 21].includes(day.day)
          ? "milestone"
          : day.day > progress.currentDay
            ? "planned"
            : day.status;

    return {
      ...day,
      status,
      minutes: session?.totalMinutes ?? day.minutes,
      exercises: session?.exercises ?? day.exercises,
      notes: session?.note ?? journal[0]?.body ?? day.notes
    };
  });
}

export function progressPercent(progress: VoiceFlexProgress) {
  return Math.min(100, Math.round((progress.currentDay / progress.durationDays) * 100));
}

export function nextMilestone(progress: VoiceFlexProgress) {
  if (progress.currentDay < 14) return { day: 14, label: "Unlocks Range Expansion Module" };
  if (progress.currentDay < 21) return { day: 21, label: "Point B confidence review" };
  return { day: 21, label: "Transformation complete" };
}
