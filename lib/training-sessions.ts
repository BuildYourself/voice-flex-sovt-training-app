import type { VoiceFlexProduct } from "@/lib/training-product";

export interface TrainingDemoStep {
  title: string;
  subtitle: string;
  imageSrc?: string;
  bullets: string[];
}

export interface TrainingSessionExercise {
  id: string;
  title: string;
  durationSeconds: number;
  tool?: string;
  description: string;
  whatToDoNow: string;
  tips: string[];
  avoid: string[];
  requiresPiano?: boolean;
  demoSteps?: TrainingDemoStep[];
  demoAudioSrc?: string | null;
  accompanimentAudioSrc?: string | null;
}

export interface TrainingSessionConfig {
  productType: VoiceFlexProduct;
  title: string;
  subtitle: string;
  day: number;
  exercises: TrainingSessionExercise[];
}

const proSetupDemo: TrainingDemoStep[] = [
  {
    title: "Step 1",
    subtitle: "Set up",
    imageSrc: "/images/session/easy-bubbles-step-1.png",
    bullets: ["Fill cup halfway", "Place straw 1-2 cm below the water", "Sit tall, relax shoulders"]
  },
  {
    title: "Step 2",
    subtitle: "Start easy",
    imageSrc: "/images/session/easy-bubbles-step-2.png",
    bullets: ["Blow gently", "Bubbles should be small and steady", "If water splashes, reduce pressure"]
  },
  {
    title: "Step 3",
    subtitle: "Keep it easy",
    imageSrc: "/images/session/easy-bubbles-step-3.png",
    bullets: ["Blow gently", "Keep bubbles small and steady", "No pushing"]
  }
];

const softMmmDemo: TrainingDemoStep[] = [
  proSetupDemo[0],
  proSetupDemo[1],
  {
    title: "Step 3",
    subtitle: "Add voice",
    imageSrc: "/images/session/soft-mmm-step-3.png",
    bullets: ["Hum gently through the straw", "Keep it easy", "No pushing"]
  }
];

export const trainingSessionConfigs: Record<VoiceFlexProduct, TrainingSessionConfig> = {
  pro: {
    productType: "pro",
    title: "Today's Guided Session",
    subtitle: "Just follow the sequence. We'll guide you step by step.",
    day: 1,
    exercises: [
      {
        id: "easy-bubbles",
        title: "Easy Bubbles",
        durationSeconds: 60,
        tool: "Yellow 10mm Straw + Water Cup",
        description:
          "Place the yellow 10mm straw into the water. Seal your lips gently around the straw. Blow softly and create small, steady bubbles. Keep your shoulders, jaw, tongue, and throat relaxed.",
        demoSteps: proSetupDemo,
        whatToDoNow: "Watch the setup guide first, then start the timer and perform the exercise calmly.",
        tips: ["Light resistance", "Steady bubbles", "No throat pressure", "No pushing"],
        avoid: ["Blowing too hard", "Making large splashing bubbles", "Tensing jaw or neck", "Running out of air too quickly"]
      },
      {
        id: "soft-mmm",
        title: "Soft \"mmm\"",
        durationSeconds: 60,
        tool: "Yellow 10mm Straw + Water Cup",
        description:
          "Keep the yellow 10mm straw in the water. Start with small, steady bubbles, then add a soft \"mmm\" sound through the straw. Keep everything gentle and relaxed.",
        demoSteps: softMmmDemo,
        whatToDoNow: "Start the same steady bubbles, then add a soft \"mmm\".",
        tips: ["Gentle vibration", "Relaxed throat", "Stable bubbling", "Voice turns on without effort"],
        avoid: ["Getting louder to hear yourself", "Forcing the sound", "Letting air escape through the lips", "Feeling scratchiness or discomfort"]
      },
      {
        id: "siren",
        title: "Siren",
        durationSeconds: 120,
        tool: "Metal 3mm Straw",
        demoAudioSrc: "/audio/session/siren-demo.mp3",
        description:
          "Switch to the thinner 3mm metal straw. Glide slowly through your comfortable range and back down. Focus on smooth transitions and easy airflow.",
        whatToDoNow: "Glide slowly up and down with steady airflow.",
        tips: ["Smooth glide", "No break or flip", "No throat squeeze", "Easy movement"],
        avoid: ["Jumping too fast", "Forcing high notes", "Letting the voice crack hard", "Pushing extra air at the top"]
      },
      {
        id: "five-notes",
        title: "5 Notes",
        durationSeconds: 120,
        tool: "Metal 3mm Straw",
        requiresPiano: true,
        demoAudioSrc: "/audio/session/five-notes-demo.mp3",
        accompanimentAudioSrc: "/audio/session/five-notes-piano.mp3",
        description: "Sing five neighboring notes through the straw. Keep every note clean and even.",
        whatToDoNow: "Move through five notes slowly and evenly.",
        tips: ["Precise but relaxed", "Even airflow", "Clean note changes", "No jaw or tongue tension"],
        avoid: ["Rushing the notes", "Losing airflow between notes", "Over-controlling the throat", "Letting pitch wobble"]
      },
      {
        id: "arpeggio",
        title: "Arpeggio",
        durationSeconds: 120,
        tool: "Metal 3mm Straw",
        requiresPiano: true,
        demoAudioSrc: "/audio/session/arpeggio-demo.mp3",
        accompanimentAudioSrc: "/audio/session/arpeggio-piano.mp3",
        description: "Sing a simple triad through the straw. Use one smooth breath and focus on precision and smoothness.",
        whatToDoNow: "Keep each note connected and light.",
        tips: ["Light and accurate", "Connected notes", "No strain at the top", "Stable breath"],
        avoid: ["Getting louder as notes rise", "Holding tension in the tongue", "Running out of air too early", "Pushing instead of gliding"]
      },
      {
        id: "two-notes",
        title: "2 Notes",
        durationSeconds: 90,
        tool: "Metal 3mm or Silicone 5mm Straw",
        requiresPiano: true,
        demoAudioSrc: "/audio/session/two-notes-demo.mp3",
        accompanimentAudioSrc: "/audio/session/two-notes-piano.mp3",
        description: "Choose one lower note and one clearly higher note. Move between them with clean, steady airflow.",
        whatToDoNow: "Jump between two notes with clean, steady airflow.",
        tips: ["Clear contrast between notes", "Easy jump", "No throat grab", "Air stays steady"],
        avoid: ["Attacking the higher note too hard", "Letting the low note collapse", "Pushing air to reach the high note", "Feeling scratchiness"]
      },
      {
        id: "voice-check",
        title: "Voice Check",
        durationSeconds: 60,
        tool: "No Straw",
        description:
          "Remove the straw. Sing or speak a short phrase gently and notice whether your voice feels freer, clearer, or more stable.",
        whatToDoNow: "Compare your voice after the straw work.",
        tips: ["Voice feels easier", "Tone feels more connected", "Less air leakage", "Less effort"],
        avoid: ["Immediately singing too loudly", "Forgetting the easy airflow feeling", "Trying to perform instead of observe"]
      }
    ]
  },
  go: {
    productType: "go",
    title: "Today's Guided Session",
    subtitle: "Just follow the sequence. We'll guide you step by step.",
    day: 1,
    exercises: [
      {
        id: "go-waves",
        title: "Waves",
        durationSeconds: 60,
        tool: "Voice Flex GO",
        demoAudioSrc: "/audio/session/waves-demo.mp3",
        description:
          "Begin with gentle wave-like airflow through Voice Flex GO. Keep the sound easy, relaxed, and steady.",
        whatToDoNow: "Start with easy airflow and let the sound move gently like a wave.",
        tips: ["Easy airflow", "Gentle movement", "Relaxed jaw", "No throat pressure"],
        avoid: ["Pushing air", "Clamping your jaw", "Raising your shoulders", "Forcing the sound"]
      },
      {
        id: "go-siren",
        title: "Siren",
        durationSeconds: 90,
        tool: "Voice Flex GO",
        demoAudioSrc: "/audio/session/siren-demo.mp3",
        description: "Glide gently from low to high and back down. Keep the device resistance comfortable and your airflow steady.",
        whatToDoNow: "Glide slowly up and down with steady airflow.",
        tips: ["Smooth glide", "Comfortable resistance", "No throat squeeze", "Easy movement"],
        avoid: ["Jumping too fast", "Forcing high notes", "Over-tightening", "Pushing extra air"]
      },
      {
        id: "go-two-notes",
        title: "2 Notes",
        durationSeconds: 90,
        tool: "Voice Flex GO",
        requiresPiano: true,
        demoAudioSrc: "/audio/session/two-notes-demo.mp3",
        accompanimentAudioSrc: "/audio/session/two-notes-piano.mp3",
        description: "Move between one lower note and one clearly higher note while keeping airflow steady and relaxed.",
        whatToDoNow: "Move between two notes with clean, steady airflow.",
        tips: ["Clear contrast between notes", "Easy jump", "No throat grab", "Air stays steady"],
        avoid: [
          "Attacking the higher note too hard",
          "Letting the low note collapse",
          "Pushing air to reach the high note",
          "Feeling scratchiness"
        ]
      },
      {
        id: "go-arpeggio",
        title: "Arpeggio",
        durationSeconds: 90,
        tool: "Voice Flex GO",
        requiresPiano: true,
        demoAudioSrc: "/audio/session/arpeggio-demo.mp3",
        accompanimentAudioSrc: "/audio/session/arpeggio-piano.mp3",
        description: "Sing a simple triad through the device. Keep the sound connected and the airflow steady.",
        whatToDoNow: "Keep each note connected and light.",
        tips: ["Light and accurate", "Connected notes", "No strain at the top", "Stable breath"],
        avoid: ["Getting louder as notes rise", "Holding tension", "Running out of air early", "Pushing instead of gliding"]
      },
      {
        id: "go-five-notes",
        title: "5 Notes",
        durationSeconds: 90,
        tool: "Voice Flex GO",
        requiresPiano: true,
        demoAudioSrc: "/audio/session/five-notes-demo.mp3",
        accompanimentAudioSrc: "/audio/session/five-notes-piano.mp3",
        description: "Move through five neighboring notes while keeping the resistance light and even.",
        whatToDoNow: "Move through five notes slowly and evenly.",
        tips: ["Precise but relaxed", "Even airflow", "Clean note changes", "Steady resistance"],
        avoid: ["Rushing the notes", "Losing airflow", "Over-controlling", "Letting pitch wobble"]
      },
      {
        id: "go-voice-check",
        title: "Voice Check",
        durationSeconds: 30,
        tool: "No Device",
        description: "Speak or sing a short phrase gently and notice whether your voice feels easier and more stable.",
        whatToDoNow: "Compare your voice after the Voice Flex GO work.",
        tips: ["Voice feels easier", "Tone feels connected", "Less effort", "More steadiness"],
        avoid: ["Singing too loudly", "Forgetting easy airflow", "Trying to perform", "Ignoring discomfort"]
      }
    ]
  }
};

export function getTrainingSessionConfig(productType: VoiceFlexProduct) {
  return trainingSessionConfigs[productType];
}

export function formatSessionDuration(seconds: number) {
  if (seconds === 90) return "1.5 min";
  const minutes = seconds / 60;
  return Number.isInteger(minutes) ? `${minutes} min` : `${minutes.toFixed(1)} min`;
}

export function formatSessionTimer(seconds: number) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

export function getSessionTotalSeconds(productType: VoiceFlexProduct) {
  return trainingSessionConfigs[productType].exercises.reduce((total, exercise) => total + exercise.durationSeconds, 0);
}
