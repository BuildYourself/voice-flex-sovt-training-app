"use client";

import { achievements, calendarDays, demoUser, journalEntries } from "@/lib/mock-data";
import type { CalendarDay, JournalEntry, UserProfile } from "@/lib/types";

export interface VoiceFlexState {
  user: UserProfile;
  journalEntries: JournalEntry[];
  calendarDays: CalendarDay[];
  selectedProgram: string;
  sessionHistory: string[];
}

const KEY = "voice-flex-demo-state";

export const defaultState: VoiceFlexState = {
  user: demoUser,
  journalEntries,
  calendarDays,
  selectedProgram: "transformation-21",
  sessionHistory: achievements.map((item) => item.title)
};

export function loadVoiceFlexState(): VoiceFlexState {
  if (typeof window === "undefined") return defaultState;
  try {
    const stored = window.localStorage.getItem(KEY);
    if (!stored) {
      window.localStorage.setItem(KEY, JSON.stringify(defaultState));
      return defaultState;
    }
    return { ...defaultState, ...JSON.parse(stored) } as VoiceFlexState;
  } catch {
    return defaultState;
  }
}

export function saveVoiceFlexState(state: VoiceFlexState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}
