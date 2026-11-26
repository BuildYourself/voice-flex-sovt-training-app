import type { GuidePattern } from "@/lib/guide-tones";
import type { KitProfile, ResistanceLevel } from "@/lib/kits";
import type { TrainingDemoStep } from "@/lib/training-sessions";

/**
 * The exercise library. Each exercise is written once and gets its tool
 * wording from the buyer's kit (see lib/kits.ts), so a Core buyer reads
 * "Metal straw + grey cap" and a GO buyer reads "Voice Flex GO".
 *
 * Skill areas feed the Training Balance bars on the milestones page.
 */
export type ExerciseSkill = "breath" | "flexibility" | "pitch" | "speaking";

/** water = bubbling straw in water, resistance = straw/cap/trainer, none = no tool. */
export type ExerciseToolKind = "water" | "resistance" | "none";

export interface ExerciseText {
  description: string;
  whatToDoNow: string;
  tips: string[];
  avoid: string[];
}

export interface ExerciseDefinition {
  id: string;
  title: string;
  skills: ExerciseSkill[];
  toolKind: ExerciseToolKind;
  requiresPiano?: boolean;
  demoAudioSrc?: string;
  accompanimentAudioSrc?: string;
  /** Guide tones generated in the browser (lib/guide-tones.ts). */
  guide?: GuidePattern;
  text: (kit: KitProfile, level: ResistanceLevel) => ExerciseText;
  demoSteps?: (kit: KitProfile, level: ResistanceLevel) => TrainingDemoStep[] | undefined;
}

function waterDemo(kit: KitProfile): TrainingDemoStep[] | undefined {
  if (!kit.hasWater) return undefined;
  // The original drawings show the straw set's bottle and yellow straw. The
  // caps set gets its own water cup drawing.
  const withImages = kit.kit === "pro_classic";
  return [
    {
      title: "Step 1",
      subtitle: "Set up",
      imageSrc: withImages ? "/images/session/easy-bubbles-step-1.png" : `${IMG}/water-cup.webp`,
      bullets: [kit.kit === "pro" ? "Fill the water cup about halfway" : "Fill a glass or bottle about halfway", "Straw about 2 cm under the water", "Sit tall, shoulders relaxed"],
    },
    {
      title: "Step 2",
      subtitle: "Start easy",
      imageSrc: withImages ? "/images/session/easy-bubbles-step-2.png" : undefined,
      bullets: ["Blow gently", "Small, steady bubbles", "Splashing means too much air"],
    },
    {
      title: "Step 3",
      subtitle: "Keep it easy",
      imageSrc: withImages ? "/images/session/easy-bubbles-step-3.png" : undefined,
      bullets: ["Same small bubbles", "Breathe in through your nose", "No pushing"],
    },
  ];
}

function bubbleHumDemo(kit: KitProfile): TrainingDemoStep[] | undefined {
  const steps = waterDemo(kit);
  if (!steps) return undefined;
  return [
    steps[0],
    steps[1],
    {
      title: "Step 3",
      subtitle: "Add voice",
      imageSrc: kit.kit === "pro_classic" ? "/images/session/soft-mmm-step-3.png" : `${IMG}/water-cup.webp`,
      bullets: ["Hum a soft \"mmm\" through the straw", "Bubbles stay small", "No pushing"],
    },
  ];
}

const IMG = "/images/exercises";
const PAT = "/images/patterns";

/** The tool at the lips, drawn for this kit. A caps kit on its lightest step uses the plain straw. */
function setupImage(kit: KitProfile, level: ResistanceLevel) {
  if (kit.kit === "go") return `${IMG}/setup-go.webp`;
  if (kit.kit === "pro_classic" || level === "lightest") return `${IMG}/setup-straw.webp`;
  // Light kits ship yellow, orange and red caps: show a yellow cap.
  return `${IMG}/${kit.capColours === "bright" ? "setup-cap-bright" : "setup-cap"}.webp`;
}

function setupStep(kit: KitProfile, level: ResistanceLevel): TrainingDemoStep {
  return {
    title: "Step 1",
    subtitle: "Set up",
    imageSrc: setupImage(kit, level),
    bullets: [
      kit.resistanceTool[level],
      kit.kit === "go" ? "Lips against the wide end, never inside" : "Lips sealed softly around the straw",
      "Sit or stand tall, shoulders loose",
    ],
  };
}

function shapeStep(pattern: string, bullets: string[]): TrainingDemoStep {
  return { title: "Step 2", subtitle: "The shape", imageSrc: `${PAT}/${pattern}.svg`, bullets };
}

function sealStep(kit: KitProfile): TrainingDemoStep {
  return {
    title: "Step 3",
    subtitle: "Check your seal",
    imageSrc: `${IMG}/${kit.kit === "go" ? "seal-check-go" : "seal-check-straw"}.webp`,
    bullets: ["Pinch your nose while you hum", "Sound stays the same = good seal", "Soft to medium volume"],
  };
}

/** Set up + the shape of the sound, plus the seal check for warm-up starters. */
function shapeDemo(pattern: string, bullets: string[], withSeal = false) {
  return (kit: KitProfile, level: ResistanceLevel): TrainingDemoStep[] => {
    const steps = [setupStep(kit, level), shapeStep(pattern, bullets)];
    return withSeal ? [...steps, sealStep(kit)] : steps;
  };
}

/** Through the tool first, then the same thing without it. */
function thenWithoutDemo(subtitle: string, image: string, bullets: string[]) {
  return (kit: KitProfile, level: ResistanceLevel): TrainingDemoStep[] => [
    setupStep(kit, level),
    { title: "Step 2", subtitle, imageSrc: `${IMG}/${image}.webp`, bullets },
  ];
}

function singleDemo(subtitle: string, image: string, bullets: string[]) {
  return (): TrainingDemoStep[] => [{ title: "How to", subtitle, imageSrc: `${IMG}/${image}.webp`, bullets }];
}

export const EXERCISES: Record<string, ExerciseDefinition> = {
  "easy-bubbles": {
    id: "easy-bubbles",
    title: "Easy Bubbles",
    skills: ["breath"],
    toolKind: "water",
    demoSteps: waterDemo,
    text: (kit) => ({
      description: `${kit.waterSetup ?? ""} Seal your lips around the straw and blow softly, with no voice. Aim for small, even bubbles. Steady bubbles mean steady air.`.trim(),
      whatToDoNow: "Blow small, steady bubbles for the whole step. Breathe in through your nose whenever you need to.",
      tips: ["Small, even bubbles", "Light pressure", "Shoulders and jaw loose", "Quiet breaths in"],
      avoid: ["Big splashing bubbles", "Blowing until you run out of air", "Tensing your jaw or neck"],
    }),
  },
  "soft-mmm": {
    id: "soft-mmm",
    title: "Bubble Hum",
    skills: ["breath"],
    toolKind: "water",
    demoSteps: bubbleHumDemo,
    text: () => ({
      description: "Keep the straw in the water. Start the same small bubbles, then add a soft \"mmm\" through the straw. You should feel a light buzz at your lips.",
      whatToDoNow: "Start the bubbles first, then turn on a soft \"mmm\".",
      tips: ["Gentle buzz at the lips", "Bubbles stay small and steady", "The voice turns on without effort"],
      avoid: ["Getting louder to hear yourself", "Forcing the sound", "Air leaking past your lips"],
    }),
  },
  "steady-air": {
    id: "steady-air",
    title: "Steady Air",
    skills: ["breath"],
    toolKind: "resistance",
    demoSteps: shapeDemo("steady-air", ["Air only, no voice", "5 to 8 seconds per breath out", "Rest, then repeat"], true),
    text: (kit) => ({
      description: `${kit.sealTip} Blow out through ${kit.toolNoun} with no voice for 5 to 8 seconds. Keep the air even and quiet, like cooling a spoon of soup. Rest, breathe in, repeat.`,
      whatToDoNow: "Breathe out slowly and evenly, rest, then go again until the timer ends.",
      tips: ["Even, quiet air", "Same strength from start to end", "Slow breath in through the nose"],
      avoid: ["Blowing hard", "Puffing your cheeks", "Raising your shoulders"],
    }),
  },
  "long-hum-hold": {
    id: "long-hum-hold",
    title: "Long Hum Hold",
    skills: ["breath"],
    toolKind: "resistance",
    demoSteps: shapeDemo("long-hum-hold", ["One easy note", "Stop before it gets hard", "Tap Start hold to time it"]),
    guide: "hold-note",
    text: (kit) => ({
      description: `Hum one easy note through ${kit.toolNoun} and hold it for as long as it stays easy. Stop before you run out of air. Rest, then do it again. Three holds is plenty.`,
      whatToDoNow: "Tap Start hold as you begin the note and Stop when you finish. The app keeps your best hold.",
      tips: ["A note from the middle of your voice", "Soft to medium volume", "The sound stays steady to the end"],
      avoid: ["Squeezing out the last few seconds", "Getting louder to last longer", "Big gasping breaths"],
    }),
  },
  waves: {
    id: "waves",
    title: "Waves",
    skills: ["flexibility", "breath"],
    toolKind: "resistance",
    demoSteps: shapeDemo("waves", ["Small, slow waves", "Soft volume", "Easy air the whole time"], true),
    demoAudioSrc: "/audio/session/waves-demo.mp3",
    text: (kit) => ({
      description: `Hum through ${kit.toolNoun} and let the pitch move up and down a little, like small waves. Keep it soft, slow and relaxed.`,
      whatToDoNow: "Make small, slow waves with your voice. Easy air the whole time.",
      tips: ["Small waves, not big ones", "Easy airflow", "Relaxed jaw"],
      avoid: ["Pushing air", "Clamping your jaw", "Raising your shoulders"],
    }),
  },
  siren: {
    id: "siren",
    title: "Siren",
    skills: ["flexibility"],
    toolKind: "resistance",
    demoSteps: shapeDemo("siren", ["Start low and easy", "Glide up only as high as stays easy", "Glide back down"], true),
    demoAudioSrc: "/audio/session/siren-demo.mp3",
    text: (kit) => ({
      description: `Glide slowly from your lowest easy note up to your highest easy note and back down, through ${kit.toolNoun}. Only go as high and as low as feels easy.`,
      whatToDoNow: "Glide slowly up and down with steady airflow.",
      tips: ["Smooth glide", "A small flip in the middle is fine, keep going", "No throat squeeze"],
      avoid: ["Rushing the glide", "Forcing the top notes", "Pushing extra air at the top"],
    }),
  },
  "pitch-hills": {
    id: "pitch-hills",
    title: "Pitch Hills",
    skills: ["flexibility"],
    toolKind: "resistance",
    demoSteps: shapeDemo("pitch-hills", ["Hold one easy note", "A small rise and fall every few seconds", "Push from the belly"]),
    text: (kit) => ({
      description: `Hold one easy note through ${kit.toolNoun}. Every few seconds, let the pitch and volume rise a little and fall back, like a small hill. The push comes from your belly, not your throat.`,
      whatToDoNow: "Make 5 or 6 small hills on one breath, then rest and repeat.",
      tips: ["Small hills, not mountains", "Your belly does the work", "Throat stays loose"],
      avoid: ["Big jumps in pitch", "Pushing from the throat", "Getting loud"],
    }),
  },
  "slide-151": {
    id: "slide-151",
    title: "Slide 1-5-1",
    skills: ["flexibility"],
    toolKind: "resistance",
    demoSteps: shapeDemo("slide-151", ["Five notes up and back", "Next round starts one note higher", "Skip rounds that feel too high"]),
    guide: "slide-151",
    text: (kit) => ({
      description: `Listen to the five notes, then slide them up and back down through ${kit.toolNoun} in one smooth glide. The next round starts one note higher.`,
      whatToDoNow: "Listen, then slide up five notes and back. Skip any round that feels too high.",
      tips: ["One smooth slide, no bumps", "Same easy volume at the top", "Start lower if the top gets tight"],
      avoid: ["Reaching for notes that strain", "Getting louder as you go up", "Rushing"],
    }),
  },
  "gentle-descents": {
    id: "gentle-descents",
    title: "Gentle Descents",
    skills: ["flexibility"],
    toolKind: "resistance",
    demoSteps: shapeDemo("gentle-descents", ["Start comfortably high", "Glide down only", "Soft and slow"]),
    text: (kit) => ({
      description: `Start on a comfortable high note and glide down to a low note through ${kit.toolNoun}. Only go down. Soft and slow.`,
      whatToDoNow: "Glide from high to low, rest, and repeat.",
      tips: ["Light, airy start", "Let the voice settle as it drops", "Slow glide"],
      avoid: ["Starting too high", "Pressing down into the low notes", "Getting loud"],
    }),
  },
  "steady-note": {
    id: "steady-note",
    title: "Steady Note",
    skills: ["pitch"],
    toolKind: "resistance",
    demoSteps: shapeDemo("steady-note", ["Match the guide note", "Hold it for 5 seconds", "No wobble"]),
    guide: "steady-notes",
    text: (kit) => ({
      description: `Match the guide note and hum it through ${kit.toolNoun}. Hold it for 5 seconds without a wobble. When the next note plays, move to it.`,
      whatToDoNow: "Match each guide note and keep it steady until it stops.",
      tips: ["Same pitch from start to end", "Even air", "Relaxed jaw"],
      avoid: ["Sliding off the note at the end", "Tightening up to hold it still", "Singing loud"],
    }),
  },
  "two-notes": {
    id: "two-notes",
    title: "2 Notes",
    skills: ["pitch"],
    toolKind: "resistance",
    demoSteps: shapeDemo("two-notes", ["One low and one high note", "Clean, easy jump", "Air stays steady"]),
    requiresPiano: true,
    demoAudioSrc: "/audio/session/two-notes-demo.mp3",
    accompanimentAudioSrc: "/audio/session/two-notes-piano.mp3",
    text: (kit) => ({
      description: `Through ${kit.toolNoun}, move between one lower note and one clearly higher note. Keep the air steady on both.`,
      whatToDoNow: "Jump between the two notes with clean, steady airflow.",
      tips: ["Clear gap between the notes", "Easy jump", "Air stays steady"],
      avoid: ["Hitting the high note hard", "Letting the low note collapse", "Pushing air to reach the top"],
    }),
  },
  "five-notes": {
    id: "five-notes",
    title: "5 Notes",
    skills: ["pitch"],
    toolKind: "resistance",
    demoSteps: shapeDemo("five-notes", ["Five notes up, then down", "Even steps", "Relaxed and clean"]),
    requiresPiano: true,
    demoAudioSrc: "/audio/session/five-notes-demo.mp3",
    accompanimentAudioSrc: "/audio/session/five-notes-piano.mp3",
    text: (kit) => ({
      description: `Sing five neighbouring notes up and back down through ${kit.toolNoun}. Keep every note clean and even.`,
      whatToDoNow: "Move through the five notes slowly and evenly.",
      tips: ["Precise but relaxed", "Even airflow", "Clean note changes"],
      avoid: ["Rushing the notes", "Losing air between notes", "Letting the pitch wobble"],
    }),
  },
  arpeggio: {
    id: "arpeggio",
    title: "Arpeggio",
    skills: ["flexibility", "pitch"],
    toolKind: "resistance",
    demoSteps: shapeDemo("arpeggio", ["Notes 1, 3, 5, 3, 1", "Connected and light", "No push at the top"]),
    requiresPiano: true,
    demoAudioSrc: "/audio/session/arpeggio-demo.mp3",
    accompanimentAudioSrc: "/audio/session/arpeggio-piano.mp3",
    text: (kit) => ({
      description: `Sing a simple arpeggio (1-3-5-3-1) through ${kit.toolNoun} in one smooth breath. Keep the notes connected and light.`,
      whatToDoNow: "Keep each note connected and light.",
      tips: ["Light and accurate", "Connected notes", "No strain at the top"],
      avoid: ["Getting louder as the notes rise", "A tight tongue", "Running out of air early"],
    }),
  },
  swell: {
    id: "swell",
    title: "Swell",
    skills: ["pitch"],
    toolKind: "resistance",
    demoSteps: shapeDemo("swell", ["Same note all the way", "Soft, a little louder, soft", "Pitch stays put"]),
    guide: "swell",
    text: (kit) => ({
      description: `Hold one note through ${kit.toolNoun}. Start soft, get a little louder, then soft again, all in one breath. The pitch stays the same the whole time.`,
      whatToDoNow: "Soft, a little louder, soft again. Rest and repeat.",
      tips: ["Pitch stays put", "Louder means a little, not a lot", "Smooth change"],
      avoid: ["Pitch rising as you get louder", "Pushing from the throat", "Cutting the end short"],
    }),
  },
  "straw-counting": {
    id: "straw-counting",
    title: "Straw Counting",
    skills: ["speaking"],
    toolKind: "resistance",
    demoSteps: thenWithoutDemo("Then without it", "voice-check", ["Count 1 to 10 out loud", "Keep the same easy buzz", "Normal speaking volume"]),
    text: (kit) => ({
      description: `Count slowly from 1 to 10 through ${kit.toolNoun}, as if you were speaking through it. Then take it away and count 1 to 10 out loud with the same easy feel.`,
      whatToDoNow: "Count through the tool, then without it. Repeat.",
      tips: ["Speak, don't sing", "Feel the same buzz without the tool", "Normal, easy volume"],
      avoid: ["Shouting the numbers", "Losing the easy feel without the tool"],
    }),
  },
  "straw-to-words": {
    id: "straw-to-words",
    title: "Straw to Words",
    skills: ["speaking"],
    toolKind: "resistance",
    demoSteps: thenWithoutDemo("Then without it", "voice-check", ["Say the same words out loud", "Same easy, forward feel", "Slow and clear"]),
    text: (kit) => ({
      description: `Through ${kit.toolNoun}, say "who", "why", "one", then "Who are you?". Then take it away and say the same words out loud. Keep the same easy, forward feel.`,
      whatToDoNow: "Words through the tool first, then the same words without it.",
      tips: ["Speak in your normal voice", "Keep the buzz near your lips", "Slow and clear"],
      avoid: ["Pushing the words out", "Dropping into a heavy, pressed voice", "Rushing"],
    }),
  },
  "hum-to-speech": {
    id: "hum-to-speech",
    title: "Hum to Speech",
    skills: ["speaking"],
    toolKind: "none",
    demoSteps: singleDemo("Mm-hmm into words", "hum-to-speech", ["Say \"mm-hmm\" like you're agreeing", "Feel the buzz at your lips", "Then: many, more, My name is..."]),
    text: () => ({
      description: "No tool for this one. Say \"mm-hmm\" a few times, like you're agreeing with someone. Then say \"many\", \"more\" and \"My name is...\", keeping that light buzz at your lips.",
      whatToDoNow: "Go from \"mm-hmm\" into a few easy words. Keep the buzz.",
      tips: ["Light buzz at the lips", "Normal speaking pitch", "Relaxed and easy"],
      avoid: ["Pressing the sound", "Speaking from the throat", "Rushing"],
    }),
  },
  "your-song": {
    id: "your-song",
    title: "Your Song",
    skills: ["flexibility"],
    toolKind: "resistance",
    demoSteps: thenWithoutDemo("Then sing it", "your-song", ["The tune through the tool first", "Then one line without it", "Soft to medium volume"]),
    text: (kit) => ({
      description: `Sing a song you know well through ${kit.toolNoun}, just the tune with no words. Then take it away and sing one line of it normally.`,
      whatToDoNow: "Sing the tune through the tool, then one line without it.",
      tips: ["Pick an easy song", "Soft to medium volume", "Notice how the line feels after"],
      avoid: ["Belting", "Picking a song at the edge of your range", "Performing instead of noticing"],
    }),
  },
  "yawn-sigh": {
    id: "yawn-sigh",
    title: "Yawn-Sigh",
    skills: [],
    toolKind: "none",
    demoSteps: singleDemo("Yawn, then sigh", "yawn-sigh", ["Gentle yawn, open throat", "Sigh from high to low", "Let your shoulders drop"]),
    text: () => ({
      description: "Start a gentle yawn, then let it turn into a sigh that slides from high to low. Let your shoulders drop as you sigh.",
      whatToDoNow: "Yawn, then sigh from high to low. Two or three times.",
      tips: ["Open, relaxed throat", "Soft sound", "Shoulders drop"],
      avoid: ["Forcing a big yawn", "Making the sigh loud"],
    }),
  },
  "voice-check": {
    id: "voice-check",
    title: "Voice Check",
    skills: [],
    toolKind: "none",
    demoSteps: singleDemo("Notice the difference", "voice-check", ["Put the tool down", "Say or sing a short line", "Notice what feels easier"]),
    text: (kit) => ({
      description: `Put ${kit.toolNoun} down. Say or sing a short line and notice how it feels. Easier? Clearer? Keep that feel when you use your voice today.`,
      whatToDoNow: "Speak or sing a short line and notice the difference.",
      tips: ["Voice feels easier", "Tone feels more connected", "Less effort"],
      avoid: ["Jumping straight into loud singing", "Performing instead of noticing"],
    }),
  },
};

export function getExercise(id: string) {
  return EXERCISES[id];
}

export function getExerciseSkills(id: string): ExerciseSkill[] {
  return EXERCISES[id]?.skills ?? [];
}

export function getExerciseToolLabel(exercise: ExerciseDefinition, kit: KitProfile, level: ResistanceLevel) {
  if (exercise.toolKind === "none") return kit.noToolLabel;
  if (exercise.toolKind === "water") return kit.waterTool ?? kit.resistanceTool[level];
  return kit.resistanceTool[level];
}
