import type { LucideIcon } from "lucide-react";
import { Activity, AirVent, CheckCircle2, Droplet, Info, Leaf, ShieldCheck, Sparkles, Target, Waves } from "lucide-react";
import type { VoiceFlexProduct } from "@/lib/training-product";

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

export const trainingOnboardingConfigs: Record<VoiceFlexProduct, TrainingOnboardingConfig> = {
  pro: {
    productType: "pro",
    productName: "Voice Flex Pro",
    title: "Let's set up your Voice Flex Pro",
    subtitle: "We'll walk you through everything you need to know so you can use Voice Flex correctly and confidently before starting Day 1.",
    steps: [
      {
        id: "welcome",
        label: "Welcome",
        title: "Welcome to Voice Flex Pro",
        body: "This setup prepares you to use your bottle and straw routine with a calm, steady approach before your first guided session.",
        bullets: ["Learn what the system is for", "Prepare your training space", "Understand the Day 1 flow"],
        callout: "No account required. Your progress is saved on this device only.",
        visualTitle: "Voice Flex Pro",
        visualSubtitle: "Bottle + straw SOVT training",
        visualKind: "pro"
      },
      {
        id: "sovt",
        label: "What is SOVT?",
        title: "What is SOVT?",
        body: "SOVT stands for Semi-Occluded Vocal Tract. It creates gentle back pressure so your voice can work with less effort.",
        bullets: ["Gentle resistance", "Easier airflow", "Less throat tension", "Steadier warm-up"],
        callout: "In simple terms: the straw helps your voice coordinate with less strain.",
        visualTitle: "SOVT",
        visualSubtitle: "Semi-Occluded Vocal Tract",
        visualKind: "sovt"
      },
      {
        id: "setup-bottle-straw",
        label: "Set up bottle + straw",
        title: "Set up your bottle + straw",
        body: "Prepare the bottle and straw so the first exercises feel easy, stable, and controlled.",
        bullets: ["Fill the bottle to the guided level", "Place the straw correctly", "Sit tall and relax your shoulders", "Keep the setup steady"],
        callout: "Your setup should feel easy before you begin bubbling.",
        visualTitle: "Bottle setup",
        visualSubtitle: "Water level + straw position",
        visualKind: "pro"
      },
      {
        id: "bubble-basics",
        label: "Bubble massage basics",
        title: "Bubble massage basics",
        body: "Small steady bubbles are the goal. The work should feel gentle and relaxed, never forceful.",
        bullets: ["Blow softly", "Keep bubbles small", "Avoid splashing", "Stay relaxed in the jaw and neck"],
        callout: "If the water splashes, reduce pressure and return to smaller bubbles.",
        visualTitle: "Easy bubbles",
        visualSubtitle: "Light pressure, steady flow",
        visualKind: "pro"
      },
      {
        id: "practice-safely",
        label: "Practice safely",
        title: "Practice safely",
        body: "A few simple safety guidelines help you get the most out of each session without overworking your voice.",
        bullets: ["Use relaxed breath", "Keep it comfortable", "Practice short and consistently", "Stop if anything hurts"],
        callout: "Gentle, steady, and consistent is the key.",
        visualTitle: "Safe practice",
        visualSubtitle: "Easy airflow, no strain",
        visualKind: "safety"
      },
      {
        id: "start-day-1",
        label: "Start Day 1",
        title: "You're ready for Day 1",
        body: "Your setup is complete. Start your first guided session when you're ready.",
        bullets: ["Follow the sequence", "Keep airflow steady", "Notice how it feels", "Build consistency"],
        callout: "Start small. A few focused minutes each day can make a real difference.",
        visualTitle: "Day 1",
        visualSubtitle: "Begin your guided routine",
        visualKind: "ready"
      }
    ],
    infoCards: [
      { Icon: Droplet, title: "Product setup", items: ["Bottle + straw", "Small steady bubbles", "Relaxed posture"] },
      { Icon: ShieldCheck, title: "Safety focus", items: ["No strain", "Gentle pressure", "Stop if it hurts"] },
      { Icon: Target, title: "Day 1 goal", items: ["Easy airflow", "Simple routine", "Consistent practice"] }
    ]
  },
  go: {
    productType: "go",
    productName: "Voice Flex GO",
    title: "Let's set up your Voice Flex GO",
    subtitle: "We'll walk you through everything you need to know so you can use Voice Flex correctly and confidently before starting Day 1.",
    steps: [
      {
        id: "welcome",
        label: "Welcome",
        title: "Welcome to Voice Flex GO",
        body: "This quick setup prepares you to use Voice Flex GO correctly and confidently before your first guided session.",
        bullets: ["Learn what the trainer does", "Find an easy comfortable starting point", "Understand the Day 1 flow"],
        callout: "No account required. Your progress is saved on this device only.",
        visualTitle: "Voice Flex GO",
        visualSubtitle: "Adjustable SOVT trainer",
        visualKind: "go",
        imageSrc: "/images/onboarding/1-welcome.png"
      },
      {
        id: "sovt",
        label: "What is SOVT?",
        title: "What is SOVT?",
        body: "SOVT stands for Semi-Occluded Vocal Tract. It creates gentle back pressure so your voice can work with less effort.",
        bullets: ["Gentle resistance", "Easier airflow", "Less throat tension", "Steadier warm-up"],
        callout: "In simple terms: the trainer helps your voice coordinate with less strain.",
        visualTitle: "SOVT",
        visualSubtitle: "Semi-Occluded Vocal Tract",
        visualKind: "sovt",
        imageSrc: "/images/onboarding/2-sovt.png"
      },
      {
        id: "setup-go",
        label: "Set up Voice Flex GO",
        title: "Set up your Voice Flex GO",
        body: "Hold the trainer comfortably and begin with a light, easy setting so your airflow feels calm and controlled.",
        bullets: ["Start with low resistance", "Keep shoulders relaxed", "Use calm steady airflow", "Make small adjustments"],
        callout: "Your setup should feel comfortable before you begin the first exercise.",
        visualTitle: "GO setup",
        visualSubtitle: "Light resistance, easy airflow",
        visualKind: "go",
        imageSrc: "/images/onboarding/3-adjust-resistance.png"
      },
      {
        id: "practice-safely",
        label: "Practice safely",
        title: "Practice safely",
        body: "A few simple safety guidelines help you get the most out of each session without overworking your voice.",
        bullets: ["Use relaxed breath", "Keep it comfortable", "Practice short and consistently", "Stop if anything hurts"],
        callout: "Gentle, steady, and consistent is the key.",
        visualTitle: "Safe practice",
        visualSubtitle: "Easy airflow, no strain",
        visualKind: "safety",
        imageSrc: "/images/onboarding/4-safety.png"
      },
      {
        id: "start-day-1",
        label: "Start Day 1",
        title: "You're ready for Day 1",
        body: "Your setup is complete. Start your first guided session when you're ready.",
        bullets: ["Follow the sequence", "Keep airflow steady", "Notice how it feels", "Build consistency"],
        callout: "Start small. A few focused minutes each day can make a real difference.",
        visualTitle: "Day 1",
        visualSubtitle: "Begin your guided routine",
        visualKind: "ready"
      }
    ],
    infoCards: [
      { Icon: AirVent, title: "Comfort setup", items: ["Low resistance", "Easy airflow", "Relaxed posture"] },
      { Icon: ShieldCheck, title: "Safety focus", items: ["No strain", "Gentle pressure", "Stop if it hurts"] },
      { Icon: Target, title: "Day 1 goal", items: ["Simple routine", "Steady tone", "Consistent practice"] }
    ]
  }
};

export const onboardingVisualIcons: Record<TrainingOnboardingStep["visualKind"], LucideIcon> = {
  pro: Waves,
  go: Activity,
  sovt: Leaf,
  safety: ShieldCheck,
  ready: Sparkles
};

export const onboardingCalloutIcon: LucideIcon = Info;
