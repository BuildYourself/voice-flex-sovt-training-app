import { notifyLocalChange } from "@/lib/local-change";
import type { VoiceFlexProduct } from "@/lib/training-product";

/**
 * A kit is the physical set of tools a buyer actually received.
 * The product type (pro / go / core) decides the training route and progress
 * namespace. The kit decides the wording: which straw, cap or trainer to use.
 *
 * - pro_classic: original Voice Flex Pro straw set (B0FZVBL3JX)
 * - pro:         Voice Flex Pro caps set with water cup (B0HFKM5D8V, B0HFKJDKCV)
 * - core:        Voice Flex Core, caps without water (B0HFRD6FF4, B0HFRJBX5L)
 * - go:          Voice Flex GO slider trainer (B0HDZRZL8B, B0HDZCGCTG, B0H299R3KN)
 *
 * Cap colours: the black kits (Pro B0HFKM5D8V, Core B0HFRD6FF4) ship white, grey and black caps.
 * The light kits (Pro white B0HFKJDKCV, Core silver B0HFRJBX5L) ship yellow, orange and red caps.
 * Same sizes either way: light 3.5 mm, medium 2.5 mm, strong 1.5 mm.
 */
export type VoiceFlexKit = "pro_classic" | "pro" | "core" | "go";

export type ResistanceLevel = "lightest" | "light" | "medium" | "strong";

/** "mono" = white, grey, black caps. "bright" = yellow, orange, red caps. */
export type CapColours = "mono" | "bright";

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
  /** Caps kits only: which cap colours this buyer has. */
  capColours?: CapColours;
}

const PRO_CAPS_ASINS = new Set(["B0HFKM5D8V", "B0HFKJDKCV"]);

const BRIGHT_CAP_ASINS = new Set(["B0HFKJDKCV", "B0HFRJBX5L"]);

/** Cap colour names by level, for the two cap sets. */
export const CAP_NAMES: Record<CapColours, Record<Exclude<ResistanceLevel, "lightest">, string>> = {
  mono: { light: "white", medium: "grey", strong: "black" },
  bright: { light: "yellow", medium: "orange", strong: "red" },
};

function capLadder(colours: CapColours): Record<ResistanceLevel, string> {
  const names = CAP_NAMES[colours];
  return {
    lightest: "Metal straw, no cap",
    light: `Metal straw + ${names.light} cap`,
    medium: `Metal straw + ${names.medium} cap`,
    strong: `Metal straw + ${names.strong} cap`,
  };
}

const CAP_LADDER = capLadder("mono");

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
    name: "Voice Flex Pro - caps set",
    contents: "metal, bamboo and silicone straws, white, grey and black caps, and a water cup",
    capColours: "mono",
    hasWater: true,
    waterTool: "Thick silicone straw + water cup",
    waterSetup: "Fill the water cup about halfway and put the thick silicone straw in, about 2 cm under the surface.",
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
    capColours: "mono",
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

export function getCapColoursForOrder(sourceAsin: string | null | undefined): CapColours {
  return BRIGHT_CAP_ASINS.has((sourceAsin ?? "").trim().toUpperCase()) ? "bright" : "mono";
}

/**
 * The wording profile for a kit. Caps kits use the cap colours this buyer has: passed in, or read from
 * this device (set from the order). On the server there is no device, so the white/grey/black names are used,
 * which only matters for text the server never shows.
 */
export function getKitProfile(kit: VoiceFlexKit, caps?: CapColours): KitProfile {
  const profile = KIT_PROFILES[kit];
  if (profile.capColours === undefined) return profile;
  const colours = caps ?? getStoredCaps(profile.productType);
  if (colours === profile.capColours) return profile;
  const names = CAP_NAMES[colours];
  return {
    ...profile,
    capColours: colours,
    resistanceTool: capLadder(colours),
    contents: profile.contents.replace("white, grey and black caps", `${names.light}, ${names.medium} and ${names.strong} caps`),
  };
}

/* ------------------------------------------------------------------ */
/* Local storage: the kit for each product route on this device.       */
/* "order" = taken from the verified order, "manual" = the user chose. */
/* A manual choice is never overwritten by the order lookup.           */
/* ------------------------------------------------------------------ */

type StoredKit = { kit: VoiceFlexKit; source: "order" | "manual"; caps?: CapColours };

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
    return {
      kit: parsed.kit,
      source: parsed.source === "manual" ? "manual" : "order",
      ...(parsed.caps === "bright" || parsed.caps === "mono" ? { caps: parsed.caps } : {}),
    };
  } catch {
    return null;
  }
}

export function getStoredKit(productType: VoiceFlexProduct): VoiceFlexKit {
  return readStoredKit(productType)?.kit ?? getDefaultKit(productType);
}

/** The cap colours on this device for a product (white/grey/black unless the order says otherwise). */
export function getStoredCaps(productType: VoiceFlexProduct): CapColours {
  return readStoredKit(productType)?.caps ?? "mono";
}

/**
 * Save the kit. caps comes from the order (getCapColoursForOrder) and is kept when not given.
 * A kit picked by hand is never replaced by the order, but the order still sets the cap colours.
 */
export function setStoredKit(
  productType: VoiceFlexProduct,
  kit: VoiceFlexKit,
  source: "order" | "manual",
  caps?: CapColours,
) {
  if (typeof window === "undefined") return;
  if (!getKitOptions(productType).includes(kit)) return;
  const existing = readStoredKit(productType);
  const nextCaps = caps ?? existing?.caps;
  const keepManual = source === "order" && existing?.source === "manual";
  const stored: StoredKit = keepManual && existing ? { ...existing } : { kit, source };
  if (nextCaps) stored.caps = nextCaps;
  try {
    const next = JSON.stringify(stored);
    if (window.localStorage.getItem(kitStorageKey(productType)) === next) return;
    window.localStorage.setItem(kitStorageKey(productType), next);
    notifyLocalChange();
  } catch {
    // Storage can be full or blocked. The default kit still works.
  }
}
