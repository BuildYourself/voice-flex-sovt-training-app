import type { LucideIcon } from "lucide-react";
import { Activity, Clock, Info, Leaf, ShieldCheck, Sparkles, Volume1, Waves } from "lucide-react";
import { CAP_NAMES, getDefaultKit, getKitPhoto, getKitProfile, isBlueGoOrder, type CapColours, type VoiceFlexKit } from "@/lib/kits";
import { getProductName, type VoiceFlexProduct } from "@/lib/training-product";

export interface TrainingOnboardingStep {
  id: string;
  label: string;
  title: string;
  body: string;
  bullets: string[];
  callout: string;
  visualTitle: string;
  visualSubtitle: string;
  visualKind: "pro" | "go" | "sovt" | "safety" | "ready";
  imageSrc?: string;
  /** "contain" for product photos (shown whole), otherwise the picture fills the frame. */
  imageFit?: "cover" | "contain";
}

export interface TrainingInfoCard {
  Icon: LucideIcon;
  title: string;
  items: string[];
}

export interface TrainingOnboardingConfig {
  productType: VoiceFlexProduct;
  productName: string;
  title: string;
  subtitle: string;
  steps: TrainingOnboardingStep[];
  infoCards: TrainingInfoCard[];
}

/*
 * The welcome guide. Kept short and plain on purpose (what SOVT is, how it
 * works, how to get the most out of the app) so the same lines can be reused
 * on listing images, A+ content and the brand store. The master copy lives in
 * VOICE-FLEX-APP/WELCOME-COPY.md on P's drive. No medical claims here.
 */

function kitStep(kit: VoiceFlexKit, caps?: CapColours): TrainingOnboardingStep {
  const profile = getKitProfile(kit, caps);
  const base = {
    id: "your-kit",
    label: "Your kit",
    callout: "Pinch your nose while you hum. If the sound doesn't change, your seal is good and all the air is going through the tool.",
    visualKind: kit === "go" ? ("go" as const) : ("pro" as const),
    visualTitle: profile.name,
    visualSubtitle: "Start light, go stronger when it feels easy",
  };

  if (kit === "pro_classic") {
    return {
      ...base,
      title: "Your straw set",
      body: "Your kit has straws in different widths. The narrower the straw, the more it holds the air back.",
      bullets: [
        "10 mm silicone straw: for bubbling in water",
        "5 mm straws (metal, silicone or bamboo): light, start here",
        "3 mm metal straw: stronger, once 5 mm feels easy",
        "Seal your lips softly around the straw",
      ],
      imageSrc: "/images/exercises/setup-straw.webp",
    };
  }

  if (kit === "pro" || kit === "core") {
    const names = CAP_NAMES[profile.capColours ?? "mono"];
    const cap = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
    return {
      ...base,
      title: kit === "pro" ? "Your straws, caps and water cup" : "Your straws and caps",
      body: "The caps go on the end of the metal straw. Each one has a smaller hole, so it holds the air back a bit more.",
      bullets: [
        "No cap: the lightest",
        `${cap(names.light)} cap: light. ${cap(names.medium)} cap: medium. ${cap(names.strong)} cap: strong`,
        ...(kit === "pro" ? ["Thick silicone straw in the water cup: for bubbling"] : []),
        `Start with no cap or the ${names.light} cap`,
      ],
      imageSrc: `/images/exercises/${profile.capColours === "bright" ? "setup-cap-bright" : "setup-cap"}.webp`,
    };
  }

  return {
    ...base,
    title: "Your Voice Flex GO",
    body: "Voice Flex GO is a small trainer you hum through. It does the same job as a narrow straw and fits in your pocket.",
    bullets: [
      "Press your lips gently against the wide end",
      "It never goes inside your mouth",
      "Set the slider where the air feels gently held back",
      "Keep the same easy feel the whole time",
    ],
    imageSrc: "/images/exercises/setup-go.webp",
  };
}

export function getTrainingOnboardingConfig(
  productType: VoiceFlexProduct,
  kit: VoiceFlexKit = getDefaultKit(productType),
  caps?: CapColours,
  sourceAsin?: string | null,
): TrainingOnboardingConfig {
  const productName = getProductName(productType);
  const isGo = kit === "go";
  // Blue GO keeps the original GO pictures (welcome, set-up slider, safe practice), as P chose.
  // They show the blue GO, so black GO and the other kits get photos and drawings of their own kit.
  const blueGo = isGo && isBlueGoOrder(sourceAsin);
  // The two wide pictures with text are shown whole (contain), so no words get cut off.
  const yourKit = blueGo
    ? { ...kitStep(kit, caps), imageSrc: "/images/onboarding/3-adjust-resistance.png", imageFit: "contain" as const }
    : kitStep(kit, caps);

  return {
    productType,
    productName,
    title: `Welcome to ${productName}`,
    subtitle: "One minute of reading, then pick a routine. That's all the setup there is.",
    steps: [
      {
        id: "welcome",
        label: "Welcome",
        title: `Welcome to ${productName}`,
        body: "This app turns your kit into a few minutes of guided voice training. Pick a routine, follow the timer, done.",
        bullets: ["What SOVT is, in plain words", "How to set up your kit", "How to get the most out of it"],
        callout: "No account needed. Your progress is linked to your order number.",
        visualTitle: productName,
        visualSubtitle: "Guided SOVT voice training",
        visualKind: isGo ? "go" : "pro",
        imageSrc: blueGo ? "/images/onboarding/1-welcome.png" : getKitPhoto(productType, kit, sourceAsin, caps),
        imageFit: blueGo ? "cover" : "contain",
      },
      {
        id: "sovt",
        label: "What is SOVT?",
        title: "What is SOVT?",
        body: "SOVT stands for semi-occluded vocal tract. In plain words: you hum or sing through a small opening, like a straw. The small opening slows the air on its way out.",
        bullets: ["Semi-occluded = partly closed", "Vocal tract = your throat and mouth", "The straw does the closing for you"],
        callout: "Voice coaches have used straw exercises for years. It's one of the simplest warm-ups there is.",
        visualTitle: "SOVT",
        visualSubtitle: "Semi-occluded vocal tract",
        visualKind: "sovt",
        imageSrc: "/images/onboarding/2-sovt.png",
      },
      {
        id: "how-it-works",
        label: "How it works",
        title: "How it works",
        body: "When the air slows at your lips, a little pressure builds back toward your throat. That helps your vocal folds vibrate with less effort, and sliding between low and high notes gets smoother. You don't need to do anything clever. Just hum.",
        bullets: ["Less effort for the same sound", "Smoother slides from low to high", "Many people notice it feels easier straight after"],
        callout: "Narrower opening = more resistance. Start light and only go narrower when it feels easy.",
        visualTitle: "Gentle back pressure",
        visualSubtitle: "Air slows at the lips, the voice works easier",
        visualKind: "sovt",
      },
      yourKit,
      {
        id: "get-the-most",
        label: "Get the most",
        title: "How to get the most out of it",
        body: "Short and often beats long and rare. A few minutes, once to three times a day, is plenty.",
        bullets: [
          "Hum soft to medium, never loud",
          "Keep your lips sealed so all the air goes through the tool",
          "Finish with a Voice Check: say a line without the tool and notice how it feels",
          "Pick the routine that fits your day: a quick reset, a full warm-up, a cool-down",
        ],
        callout: "Your streak counts every day you train. Move to stronger resistance when it feels easy, not on a schedule.",
        visualTitle: "Short and often",
        visualSubtitle: "2 to 10 minutes, 1 to 3 times a day",
        visualKind: "ready",
        imageSrc: `/images/exercises/${isGo ? "seal-check-go" : "seal-check-straw"}.webp`,
      },
      {
        id: "stay-safe",
        label: "Stay safe",
        title: "Keep it easy",
        body: "Every exercise should feel easy. If something hurts, stop.",
        bullets: [
          "Stop if you feel pain, scratchiness or dizziness",
          "Light-headed? Take a break and breathe normally",
          "Hoarseness that hasn't improved after 4 weeks needs a doctor",
          "Voice Flex is for training, not for treating a voice problem",
        ],
        callout: "Ready? The Daily Session is a good first routine.",
        visualTitle: "Safe practice",
        visualSubtitle: "Easy airflow, no strain",
        visualKind: "safety",
        imageSrc: blueGo ? "/images/onboarding/4-safety.png" : undefined,
        imageFit: "contain",
      },
    ],
    infoCards: [
      { Icon: Clock, title: "Short and often", items: ["2 to 10 minutes", "1 to 3 times a day", "Every day counts toward your streak"] },
      { Icon: Volume1, title: "Soft and steady", items: ["Soft to medium volume", "Lips sealed", "Start with light resistance"] },
      { Icon: ShieldCheck, title: "Stop signs", items: ["Pain or scratchiness", "Dizziness", "Hoarseness over 4 weeks"] },
    ],
  };
}

/** Default config per product, for code that has no kit at hand. */
export const trainingOnboardingConfigs: Record<VoiceFlexProduct, TrainingOnboardingConfig> = {
  pro: getTrainingOnboardingConfig("pro"),
  go: getTrainingOnboardingConfig("go"),
  core: getTrainingOnboardingConfig("core"),
};

export const onboardingVisualIcons: Record<TrainingOnboardingStep["visualKind"], LucideIcon> = {
  pro: Waves,
  go: Activity,
  sovt: Leaf,
  safety: ShieldCheck,
  ready: Sparkles,
};

export const onboardingCalloutIcon: LucideIcon = Info;
