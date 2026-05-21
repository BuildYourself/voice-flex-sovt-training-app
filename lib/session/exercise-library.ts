export interface ExerciseDefinition {
  id: string;
  title: string;
  defaultTool: string;
  instructions: string;
  requiresPianoDefault?: boolean;
  demoAudioUrl?: string | null;
  practiceAudioUrl?: string | null;
  tips: string[];
  mistakes: string[];
}

const arpeggioDemo = "/audio/session/arpeggio-demo.mp3";
const arpeggioPiano = "/audio/session/arpeggio-piano.mp3";
const fiveNotesPiano = "/audio/session/five-notes-piano.mp3";
const sirenDemo = "/audio/session/siren-demo.mp3";
const twoNotesDemo = "/audio/session/two-notes-demo.mp3";
const twoNotesPiano = "/audio/session/two-notes-piano.mp3";
const wavesDemo = "/audio/session/waves-demo.mp3";

export const exerciseLibrary: ExerciseDefinition[] = [
  {
    id: "easy-bubbles",
    title: "Easy Bubbles",
    defaultTool: "Yellow 10mm Straw + Water Cup",
    instructions:
      "Place the yellow 10mm straw into the water. Seal your lips gently around the straw. Blow softly and create small, steady bubbles. Keep your shoulders, jaw, tongue, and throat relaxed.",
    requiresPianoDefault: false,
    demoAudioUrl: null,
    tips: ["Light resistance", "Steady bubbles", "No throat pressure", "No pushing"],
    mistakes: ["Blowing too hard", "Making large splashing bubbles", "Tensing jaw or neck", "Running out of air too quickly"]
  },
  {
    id: "soft-mmm",
    title: "Soft “mmm”",
    defaultTool: "Yellow 10mm Straw + Water Cup",
    instructions:
      "Keep the yellow 10mm straw in the water. Start with small, steady bubbles, then add a soft “mmm” sound through the straw. Keep everything gentle and relaxed.",
    requiresPianoDefault: false,
    demoAudioUrl: null,
    tips: ["Gentle vibration", "Relaxed throat", "Stable bubbling", "Voice turns on without effort"],
    mistakes: ["Getting louder to hear yourself", "Forcing the sound", "Letting air escape through the lips", "Feeling scratchiness or discomfort"]
  },
  {
    id: "siren",
    title: "Siren",
    defaultTool: "Metal 3mm Straw",
    instructions:
      "Switch to the thinner 3mm metal straw. Perform wide, controlled sirens through your vocal range, from your lowest comfortable note to your highest comfortable note and back. Focus on smooth transitions between registers.",
    requiresPianoDefault: false,
    demoAudioUrl: sirenDemo,
    tips: ["Smooth glide", "No break or flip", "No throat squeeze", "Easy movement from low to high and back"],
    mistakes: ["Jumping too fast", "Forcing high notes", "Letting the voice crack hard", "Pushing extra air at the top"]
  },
  {
    id: "waves",
    title: "Waves",
    defaultTool: "Metal 3mm Straw",
    instructions: "Move smoothly through your comfortable range in wave-like patterns. Keep tone connected and airflow steady.",
    requiresPianoDefault: false,
    demoAudioUrl: wavesDemo,
    tips: ["Steady airflow", "Smooth transitions", "Relaxed jaw"],
    mistakes: ["Overpushing", "Tensing neck", "Losing airflow support"]
  },
  {
    id: "five-notes",
    title: "5 Notes",
    defaultTool: "Metal 3mm Straw",
    instructions:
      "Sing five neighboring notes through the straw. Example: C-D-E-F-G, then G-F-E-D-C. Keep every note clean and even. Repeat from slightly different starting pitches.",
    requiresPianoDefault: true,
    demoAudioUrl: null,
    practiceAudioUrl: fiveNotesPiano,
    tips: ["Precise but relaxed", "Even airflow", "Clean note changes", "No jaw or tongue tension"],
    mistakes: ["Rushing the notes", "Losing airflow between notes", "Over-controlling the throat", "Letting pitch wobble"]
  },
  {
    id: "arpeggio",
    title: "Arpeggio",
    defaultTool: "Metal 3mm Straw",
    instructions:
      "Sing a simple triad through the straw. Example: C-E-G-C, then C-G-E-C. Use one smooth breath. Repeat 6 times, starting slightly higher each time. Focus on precision and smoothness.",
    requiresPianoDefault: true,
    demoAudioUrl: arpeggioDemo,
    practiceAudioUrl: arpeggioPiano,
    tips: ["Light and accurate", "Connected notes", "No strain at the top", "Stable breath"],
    mistakes: ["Getting louder as notes rise", "Holding tension in the tongue", "Running out of air too early", "Pushing instead of gliding"]
  },
  {
    id: "two-notes",
    title: "2 Notes",
    defaultTool: "Metal 3mm or Silicone 5mm Straw",
    instructions:
      "Choose one lower note and one clearly higher note. Move between them: low-high-low-high. Keep both notes stable and clean. Make the jump precise, not forced.",
    requiresPianoDefault: true,
    demoAudioUrl: twoNotesDemo,
    practiceAudioUrl: twoNotesPiano,
    tips: ["Clear contrast between notes", "Easy jump", "No throat grab", "Air stays steady"],
    mistakes: ["Attacking the higher note too hard", "Letting the low note collapse", "Pushing air to reach the high note", "Feeling scratchiness"]
  },
  {
    id: "voice-check",
    title: "Voice Check",
    defaultTool: "No Straw",
    instructions:
      "Remove the straw. Sing or speak a short phrase gently. Try to keep the same easy, balanced feeling. Notice whether your voice feels freer, clearer, or more stable.",
    requiresPianoDefault: false,
    demoAudioUrl: null,
    tips: ["Voice feels easier", "Tone feels more connected", "Less air leakage", "Less effort"],
    mistakes: ["Immediately singing too loudly", "Forgetting the easy airflow feeling", "Trying to perform instead of observe"]
  }
];
