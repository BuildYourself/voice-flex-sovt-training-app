import type { VoiceFlexProduct } from "@/lib/training-product";

/**
 * A kit is the physical set of tools a buyer actually received.
 * The product type (pro / go / core) decides the training route and progress
 * namespace. The kit decides the wording: which straw, cap or trainer to use.
 *
 * - pro_classic: original Voice Flex Pro straw set (B0FZVBL3JX)
 * - pro:         Voice Flex Pro with caps + bottle (B0HFKM5D8V, B0HFKJDKCV)
 * - core:        Voice Flex Core, caps without water (B0HFRD6FF4, B0HFRJBX5L)
 * - go:          Voice Flex GO slider trainer (B0HDZRZL8B, B0HDZCGCTG, B0H299R3KN)
 */
export type VoiceFlexKit = "pro_classic" | "pro" | "core" | "go";

export type ResistanceLevel = "lightest" | "light" | "medium" | "strong";

export interface KitProfile {
  kit: VoiceFlexKit;
  productType: VoiceFlexProduct;
  /** Name shown to the customer, e.g. on the routine picker. */
  name: string;
  /** Short description of what is in the box. */
  contents: string;
  hasWater: boolean;
  /** Tool line for the bubbling exercises (water kits only). */
  waterTool?: string;
  /** One-line water setup used inside exercise text. */
  waterSetup?: string;
  resistanceTool: Record<ResistanceLevel, string>;
  /** How the lips meet the tool. */
  sealTip: string;
  /** "the straw" / "the trainer", used inside sentences. */
  toolNoun: string;
  noToolLabel: string;
}

const PRO_CAPS_ASINS = new Set(["B0HFKM5D8V", "B0HFKJDKCV"]);

const CAP_LADDER: Record<ResistanceLevel, string> = {
  lightest: "Metal straw, no cap",
  light: "Metal straw + white cap",
  medium: "Metal straw + grey cap",
  strong: "Metal straw + black cap",
};

export const KIT_PROFILES: Record<VoiceFlexKit, KitProfile> = {
  pro_classic: {
    kit: "pro_classic",
    productType: "pro",
    name: "Voice Flex Pro - straw set",
    contents: "5 mm straws (metal, silicone, bamboo), a 3 mm metal straw and a 10 mm silicone bubbling straw",
    hasWater: true,
    waterTool: "10 mm silicone straw + water",
    waterSetup: "Put the 10 mm silicone straw in a glass or bottle of water, about 2 cm under the surface.",
    resistanceTool: {
      lightest: "5 mm straw (metal, silicone or bamboo)",
      light: "5 mm straw (metal, silicone or bamboo)",
      medium: "3 mm metal straw",
      strong: "3 mm metal straw",
    },
    sealTip: "Seal your lips softly around the straw so no air escapes.",
    toolNoun: "the straw",
    noToolLabel: "No straw",
  },
  pro: {
    kit: "pro",
    productType: "pro",
    name: "Voice Flex Pro - caps and bottle",
    contents: "metal straws, white, grey and black caps, a wide silicone bubbling straw and a bottle",
    hasWater: true,
    waterTool: "Wide silicone straw + bottle with water",
    waterSetup: "Put the wide silicone straw in the bottle with water, about 2 cm under the surface.",
    resistanceTool: CAP_LADDER,
    sealTip: "Seal your lips softly around the straw so no air escapes.",
    toolNoun: "the straw",
    noToolLabel: "No straw",
  },
  core: {
    kit: "core",
    productType: "core",
    name: "Voice Flex Core",
    contents: "metal straws with white, grey and black caps",
    hasWater: false,
    resistanceTool: CAP_LADDER,
    sealTip: "Seal your lips softly around the straw so no air escapes.",
    toolNoun: "the straw",
    noToolLabel: "No straw",
  },
  go: {
    kit: "go",
    productType: "go",
    name: "Voice Flex GO",
    contents: "the Voice Flex GO trainer",
    hasWater: false,
    resistanceTool: {
      lightest: "Voice Flex GO",
      light: "Voice Flex GO",
      medium: "Voice Flex GO",
      strong: "Voice Flex GO",
    },
    sealTip: "Press your lips gently against the wide end. It never goes inside your mouth.",
    toolNoun: "the trainer",
    noToolLabel: "No trainer",
  },
};

export function isVoiceFlexKit(value: unknown): value is VoiceFlexKit {
  return value === "pro_classic" || value === "pro" || value === "core" || value === "go";
}

export function getDefaultKit(productType: VoiceFlexProduct): VoiceFlexKit {
  // Most Pro buyers own the original straw set, so it stays the Pro default.
  if (productType === "pro") return "pro_classic";
  return productType;
}

/** Which kits make sense for a product route. Only Pro has two. */
export function getKitOptions(productType: VoiceFlexProduct): VoiceFlexKit[] {
  if (productType === "pro") return ["pro_classic", "pro"];
  return [productType];
}

export function getKitForOrder(productType: VoiceFlexProduct, sourceAsin: string | null | undefined): VoiceFlexKit {
  const asin = (sourceAsin ?? "").trim().toUpperCase();
  if (productType === "pro") return PRO_CAPS_ASINS.has(asin) ? "pro" : "pro_classic";
  return productType;
}

export function getKitProfile(kit: VoiceFlexKit) {
  return KIT_PROFILES[kit];
}

/* ------------------------------------------------------------------ */
/* Local storage: the kit for each product route on this device.       */
/* "order" = taken from the verified order, "manual" = the user chose. */
/* A manual choice is never overwritten by the order lookup.           */
/* ------------------------------------------------------------------ */

type StoredKit = { kit: VoiceFlexKit; source: "order" | "manual" };

function kitStorageKey(productType: VoiceFlexProduct) {
  return `voiceflex_kit_${productType}`;
}

function readStoredKit(productType: VoiceFlexProduct): StoredKit | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(kitStorageKey(productType));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredKit>;
    if (!isVoiceFlexKit(parsed.kit)) return null;
    if (!getKitOptions(productType).includes(parsed.kit)) return null;
    return { kit: parsed.kit, source: parsed.source === "manual" ? "manual" : "order" };
  } catch {
    return null;
  }
}

export function getStoredKit(productType: VoiceFlexProduct): VoiceFlexKit {
  return readStoredKit(productType)?.kit ?? getDefaultKit(productType);
}

export function setStoredKit(productType: VoiceFlexProduct, kit: VoiceFlexKit, source: "order" | "manual") {
  if (typeof window === "undefined") return;
  if (!getKitOptions(productType).includes(kit)) return;
  const existing = readStoredKit(productType);
  if (source === "order" && existing?.source === "manual") return;
  try {
    window.localStorage.setItem(kitStorageKey(productType), JSON.stringify({ kit, source }));
  } catch {
    // Storage can be full or blocked. The default kit still works.
  }
}
