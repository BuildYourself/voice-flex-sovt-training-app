export type PhaseStatus = "completed" | "current" | "locked" | "future";

export interface UserProfile {
  id: string;
  displayName: string;
  currentProgramId: string;
  dayStreak: number;
  totalMinutes: number;
  sessionsCompleted: number;
  activeProgramDay: number;
}

export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  durationDays: number;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  colorTheme: string;
  featured?: boolean;
}

export interface Exercise {
  id: string;
  title: string;
  type: string;
  description: string;
  durationMinutes: number;
  difficulty: "Easy" | "Medium";
  instructions: string[];
  howItShouldFeel: string[];
  commonMistakes: string[];
  order: number;
}

export interface SessionStep {
  id: string;
  title: string;
  subtitle: string;
  durationMinutes: number;
  status: "completed" | "current" | "upcoming";
}

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  mood: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt?: string;
}

export interface CalendarDay {
  day: number;
  status: "completed" | "today" | "planned" | "rest" | "milestone" | "empty";
  minutes?: number;
  exercises?: string[];
  notes?: string;
}
