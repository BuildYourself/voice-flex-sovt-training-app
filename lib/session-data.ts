export interface ProSessionStep {
  id: string;
  title: string;
  durationSeconds: number;
  displayDuration: string;
  tool: string;
  instruction: string;
  howItShouldFeel: string[];
  commonMistakes: string[];
}

export const voiceFlexProSession = {
  sessionName: "Voice Flex Pro - Professional SOVT Routine",
  displayName: "Voice Flex Pro — Professional SOVT Routine",
  totalSeconds: 630,
  totalDisplay: "10:30",
  steps: [
    {
      id: "easy-bubbles",
      title: "Easy Bubbles",
      durationSeconds: 60,
      displayDuration: "1 min",
      tool: "Yellow 10mm Straw + Water Cup",
      instruction:
        "Place the yellow 10mm straw into the water. Seal your lips gently around the straw. Blow softly and create small, steady bubbles. Keep your shoulders, jaw, tongue, and throat relaxed.",
      howItShouldFeel: ["Light resistance", "Steady bubbles", "No throat pressure", "No pushing"],
      commonMistakes: ["Blowing too hard", "Making large splashing bubbles", "Tensing jaw or neck", "Running out of air too quickly"]
    },
    {
      id: "soft-mmm",
      title: "Soft “mmm”",
      durationSeconds: 60,
      displayDuration: "1 min",
      tool: "Yellow 10mm Straw + Water Cup",
      instruction:
        "Keep the yellow 10mm straw in the water. Start with small, steady bubbles, then add a soft ‘mmm’ sound through the straw. Keep everything gentle and relaxed.",
      howItShouldFeel: ["Gentle vibration", "Relaxed throat", "Stable bubbling", "Voice turns on without effort"],
      commonMistakes: ["Getting louder to hear yourself", "Forcing the sound", "Letting air escape through the lips", "Feeling scratchiness or discomfort"]
    },
    {
      id: "siren",
      title: "Siren",
      durationSeconds: 120,
      displayDuration: "2 min",
      tool: "Metal 3mm Straw",
      instruction:
        "Switch to the thinner 3mm metal straw. Perform wide, controlled sirens through your vocal range, from your lowest comfortable note to your highest comfortable note and back. Focus on smooth transitions between registers.",
      howItShouldFeel: ["Smooth glide", "No break or flip", "No throat squeeze", "Easy movement from low to high and back"],
      commonMistakes: ["Jumping too fast", "Forcing high notes", "Letting the voice crack hard", "Pushing extra air at the top"]
    },
    {
      id: "five-notes",
      title: "5 Notes",
      durationSeconds: 120,
      displayDuration: "2 min",
      tool: "Metal 3mm Straw",
      instruction:
        "Sing five neighboring notes through the straw. Example: C-D-E-F-G, then G-F-E-D-C. Keep every note clean and even. Repeat from slightly different starting pitches.",
      howItShouldFeel: ["Precise but relaxed", "Even airflow", "Clean note changes", "No jaw or tongue tension"],
      commonMistakes: ["Rushing the notes", "Losing airflow between notes", "Over-controlling the throat", "Letting pitch wobble"]
    },
    {
      id: "arpeggio",
      title: "Arpeggio",
      durationSeconds: 120,
      displayDuration: "2 min",
      tool: "Metal 3mm Straw",
      instruction:
        "Sing a simple triad through the straw. Example: C-E-G-C, then C-G-E-C. Use one smooth breath. Repeat 6 times, starting slightly higher each time. Focus on precision and smoothness.",
      howItShouldFeel: ["Light and accurate", "Connected notes", "No strain at the top", "Stable breath"],
      commonMistakes: ["Getting louder as notes rise", "Holding tension in the tongue", "Running out of air too early", "Pushing instead of gliding"]
    },
    {
      id: "two-notes",
      title: "2 Notes",
      durationSeconds: 90,
      displayDuration: "1.5 min",
      tool: "Metal 3mm or Silicone 5mm Straw",
      instruction:
        "Choose one lower note and one clearly higher note. Move between them: low-high-low-high. Keep both notes stable and clean. Make the jump precise, not forced.",
      howItShouldFeel: ["Clear contrast between notes", "Easy jump", "No throat grab", "Air stays steady"],
      commonMistakes: ["Attacking the higher note too hard", "Letting the low note collapse", "Pushing air to reach the high note", "Feeling scratchiness"]
    },
    {
      id: "voice-check",
      title: "Voice Check",
      durationSeconds: 60,
      displayDuration: "1 min",
      tool: "No Straw",
      instruction:
        "Remove the straw. Sing or speak a short phrase gently. Try to keep the same easy, balanced feeling. Notice whether your voice feels freer, clearer, or more stable.",
      howItShouldFeel: ["Voice feels easier", "Tone feels more connected", "Less air leakage", "Less effort"],
      commonMistakes: ["Immediately singing too loudly", "Forgetting the easy airflow feeling", "Trying to perform instead of observe"]
    }
  ] satisfies ProSessionStep[]
};

