import type { Achievement, CalendarDay, Exercise, JournalEntry, Program, SessionStep, UserProfile } from "@/lib/types";

export const demoUser: UserProfile = {
  id: "demo-user",
  displayName: "Alex Morgan",
  currentProgramId: "transformation-21",
  dayStreak: 12,
  totalMinutes: 245,
  sessionsCompleted: 18,
  activeProgramDay: 12
};

export const programs: Program[] = [
  { id: "beginner", title: "Beginner Singer", slug: "beginner-singer", description: "Build strong foundations", durationDays: 21, difficulty: "Easy", category: "Foundations", colorTheme: "purple" },
  { id: "warmup", title: "Daily Warm-Up", slug: "daily-warm-up", description: "Activate & prepare your voice", durationDays: 10, difficulty: "Easy", category: "Warm-Up", colorTheme: "green" },
  { id: "recovery", title: "Voice Recovery", slug: "voice-recovery", description: "Restore, heal & rebuild strength", durationDays: 14, difficulty: "Easy", category: "Recovery", colorTheme: "pink" },
  { id: "speaking", title: "Speaking Voice", slug: "speaking-voice", description: "Speak clearly & confidently", durationDays: 7, difficulty: "Easy", category: "Speaking", colorTheme: "blue" },
  { id: "range", title: "Range Builder", slug: "range-builder", description: "Expand range safely & smoothly", durationDays: 21, difficulty: "Medium", category: "Range", colorTheme: "amber" },
  { id: "transformation-21", title: "21-Day Transformation", slug: "21-day-transformation", description: "Complete system. Total transformation.", durationDays: 21, difficulty: "Medium", category: "Complete", colorTheme: "navy", featured: true }
];

export const todayExercises: Exercise[] = [
  {
    id: "breath-reset",
    title: "Breath & Body Reset",
    type: "Breathing",
    description: "Release tension and set your breath low and wide.",
    durationMinutes: 5,
    difficulty: "Easy",
    instructions: ["Stand tall with soft knees.", "Inhale into the lower ribs.", "Release your shoulders and jaw.", "Exhale quietly and evenly."],
    howItShouldFeel: ["Open through the ribs.", "Relaxed throat.", "Quiet, easy breath.", "Grounded posture."],
    commonMistakes: ["Lifting the shoulders.", "Locking the knees.", "Forcing the exhale.", "Tensing the neck."],
    order: 1
  },
  {
    id: "lip-trill",
    title: "Lip Trill Warm-Up",
    type: "Warm-Up",
    description: "Build consistent airflow and relaxed lips with a smooth trill.",
    durationMinutes: 5,
    difficulty: "Easy",
    instructions: ["Take a relaxed breath in.", "Start a gentle lip trill on a comfortable pitch.", "Keep airflow steady and even.", "Sustain as smoothly as you can."],
    howItShouldFeel: ["Vibrations at the lips.", "Easy airflow, no strain.", "Steady and relaxed.", "Focused but effortless."],
    commonMistakes: ["Pushing too much air.", "Tension in the jaw or lips.", "Trill breaking or stopping.", "Holding your breath."],
    order: 2
  },
  {
    id: "pitch-control",
    title: "Pitch Control Drill",
    type: "Technique",
    description: "Train steady pitch movement through simple intervals.",
    durationMinutes: 10,
    difficulty: "Easy",
    instructions: ["Choose a comfortable note.", "Slide slowly up a small interval.", "Return without squeezing.", "Repeat with the SOVT tool."],
    howItShouldFeel: ["Stable pitch center.", "No throat pressure.", "Smooth onset.", "Air stays even."],
    commonMistakes: ["Rushing the slide.", "Getting louder to reach pitch.", "Jaw tension.", "Breath collapse."],
    order: 3
  },
  {
    id: "vowel-resonance",
    title: "Vowel Resonance",
    type: "Tone",
    description: "Shape vowels with clean resonance and easy tone.",
    durationMinutes: 8,
    difficulty: "Medium",
    instructions: ["Start on an easy pitch.", "Move from oo to ah slowly.", "Keep the tone connected.", "Notice where vibration shifts."],
    howItShouldFeel: ["Forward resonance.", "Stable volume.", "Open vowels.", "No tongue tension."],
    commonMistakes: ["Over-opening the mouth.", "Spreading vowels.", "Losing airflow.", "Pushing for brightness."],
    order: 4
  },
  {
    id: "cooldown",
    title: "Cool Down & Reflect",
    type: "Recovery",
    description: "Reset your voice and capture the win.",
    durationMinutes: 5,
    difficulty: "Easy",
    instructions: ["Hum softly.", "Use gentle straw bubbles.", "Release the jaw.", "Write one sentence about how you feel."],
    howItShouldFeel: ["Easy vibration.", "Warm voice.", "Calm breath.", "Clear finish."],
    commonMistakes: ["Skipping recovery.", "Ending with strain.", "Loud humming.", "Forgetting to reflect."],
    order: 5
  }
];

export const sessionSteps: SessionStep[] = [
  { id: "breath-reset", title: "Breath & Body Reset", subtitle: "5 min", durationMinutes: 5, status: "completed" },
  { id: "lip-trill", title: "Lip Trill Warm-Up", subtitle: "5 min • Current", durationMinutes: 5, status: "current" },
  { id: "pitch-control", title: "Pitch Control Drill", subtitle: "10 min", durationMinutes: 10, status: "upcoming" },
  { id: "vowel-resonance", title: "Vowel Resonance", subtitle: "8 min", durationMinutes: 8, status: "upcoming" },
  { id: "cooldown", title: "Cool Down & Reflect", subtitle: "5 min", durationMinutes: 5, status: "upcoming" }
];

export const journalEntries: JournalEntry[] = [
  { id: "j1", title: "Today my tone felt more relaxed and natural.", body: "Today my tone felt more relaxed and natural.", mood: "Calm", createdAt: "Today" },
  { id: "j2", title: "High notes felt easier after straw work.", body: "High notes felt easier after straw work.", mood: "Confident", createdAt: "Yesterday" },
  { id: "j3", title: "Breath support was solid during long phrases.", body: "Breath support was solid during long phrases.", mood: "Focused", createdAt: "2 days ago" }
];

export const achievements: Achievement[] = [
  { id: "a1", title: "Consistent Streak", description: "Complete 7 days in a row", unlockedAt: "Unlocked" },
  { id: "a2", title: "Early Momentum", description: "Complete 5 sessions", unlockedAt: "Unlocked" },
  { id: "a3", title: "Halfway Hero", description: "Reach Day 10", unlockedAt: "Unlocked" }
];

export const calendarDays: CalendarDay[] = Array.from({ length: 35 }, (_, index) => {
  const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0, 14, 16, 0, 0, 0, 0, 0, 0, 0, 23, 0, 0, 0, 0, 0, 0, 30, 1, 2, 3, 4, 5];
  const day = values[index];
  if (!day) return { day: 0, status: "empty" };
  if (day === 12) return { day, status: "today", minutes: 33, exercises: todayExercises.map((item) => item.title), notes: "Tone felt easier after lip trills." };
  if (day === 14 || day === 21) return { day, status: "milestone", minutes: 0 };
  if ([1, 7, 16, 23, 30].includes(day)) return { day, status: "rest", minutes: 0 };
  if (day < 12) return { day, status: "completed", minutes: 25 + (day % 4) * 3, exercises: ["Breath reset", "SOVT flow", "Pitch control"], notes: "Completed the guided session." };
  return { day, status: "planned", minutes: 0 };
});

export const improvements = [
  { title: "Pitch Stability", value: "+23%", color: "#22c55e", data: [8, 12, 14, 20, 18, 21, 29, 27, 31, 38] },
  { title: "Breath Control", value: "+18%", color: "#0d8cff", data: [10, 16, 21, 18, 24, 30, 26, 31, 38, 42] },
  { title: "Resonance", value: "+21%", color: "#6d3fd6", data: [12, 17, 19, 25, 21, 29, 34, 31, 39, 45] },
  { title: "Range (Octaves)", value: "+0.8", color: "#14b8a6", data: [5, 9, 13, 10, 15, 22, 19, 25, 31, 36] }
];
