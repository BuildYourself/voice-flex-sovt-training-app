export interface SessionStepUsage {
  exerciseId: string;
  durationSec: number;
  position: number;
  requiresPianoOverride?: boolean;
  demoAudioUrlOverride?: string | null;
  practiceAudioUrlOverride?: string | null;
  instructionsOverride?: string;
}

export interface SessionTemplate {
  id: string;
  title: string;
  steps: SessionStepUsage[];
}

export const todayGuidedSessionTemplate: SessionTemplate = {
  id: "voice-flex-pro-day-1",
  title: "Voice Flex Pro — Professional SOVT Routine",
  steps: [
    { exerciseId: "easy-bubbles", durationSec: 60, position: 1 },
    { exerciseId: "soft-mmm", durationSec: 60, position: 2 },
    { exerciseId: "siren", durationSec: 120, position: 3 },
    { exerciseId: "five-notes", durationSec: 120, position: 4 },
    { exerciseId: "arpeggio", durationSec: 120, position: 5 },
    { exerciseId: "two-notes", durationSec: 90, position: 6 },
    { exerciseId: "voice-check", durationSec: 60, position: 7 }
  ]
};

