import { MILESTONE_STORAGE_PREFIX } from "@/lib/local-milestones";
import { TRAINING_PROGRESS_KEYS } from "@/lib/training-progress";
import type { VoiceFlexProduct } from "@/lib/training-product";

/**
 * Who is training on this device, per product: the order number and, for orders with 2+ units,
 * which person on that order. Every progress request carries both.
 */
export type TrainingIdentity = {
  orderNumber: string;
  profileSlot: number;
  profileName: string | null;
  /** Units of this product on the order. More than 1 means several people share the order number. */
  seats: number;
};

/** Older app versions kept one order number for the whole device. */
export const VERIFIED_ORDER_NUMBER_KEY = "voiceflex_verified_order_number";

function identityKey(productType: VoiceFlexProduct) {
  return `voiceflex_identity_${productType}`;
}

function sameOrder(a: string, b: string) {
  const clean = (value: string) => value.trim().replace(/^#/, "").replace(/\s+/g, "").toUpperCase();
  return clean(a) === clean(b);
}

/** The identity saved for this product by this app version (no fallback). */
function getStoredIdentity(productType: VoiceFlexProduct): TrainingIdentity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(identityKey(productType));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<TrainingIdentity>;
    if (typeof parsed.orderNumber !== "string" || !parsed.orderNumber) return null;
    return {
      orderNumber: parsed.orderNumber,
      profileSlot: Number.isInteger(parsed.profileSlot) && Number(parsed.profileSlot) > 0 ? Number(parsed.profileSlot) : 1,
      profileName: typeof parsed.profileName === "string" ? parsed.profileName : null,
      seats: Number.isInteger(parsed.seats) && Number(parsed.seats) > 0 ? Number(parsed.seats) : 1,
    };
  } catch {
    return null;
  }
}

export function getTrainingIdentity(productType: VoiceFlexProduct): TrainingIdentity | null {
  const stored = getStoredIdentity(productType);
  if (stored || typeof window === "undefined") return stored;
  try {
    const legacy = window.localStorage.getItem(VERIFIED_ORDER_NUMBER_KEY);
    return legacy ? { orderNumber: legacy, profileSlot: 1, profileName: null, seats: 1 } : null;
  } catch {
    return null;
  }
}

/** The fields every progress API call needs, or null when this device has no verified order. */
export function getIdentityRequestFields(productType: VoiceFlexProduct) {
  const identity = getTrainingIdentity(productType);
  return identity ? { orderNumber: identity.orderNumber, profileSlot: identity.profileSlot } : null;
}

/** Clear one person's data for a product from this device (another person or order is taking over). */
export function clearPersonalData(productType: VoiceFlexProduct) {
  if (typeof window === "undefined") return;
  try {
    const keys = [
      TRAINING_PROGRESS_KEYS[productType],
      `voiceflex_kit_${productType}`,
      `voiceflex_best_hold_${productType}`,
      `voiceflex_review_request_${productType}`,
      `voiceflex_order_source_${productType}`,
      `voiceflex_order_asin_${productType}`,
      `voiceflex_sync_meta_${productType}`,
      `voiceflex_library_${productType}`,
      "voiceflex_voice_range",
    ];
    keys.forEach((key) => window.localStorage.removeItem(key));
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(`${MILESTONE_STORAGE_PREFIX}:${productType}:`))
      .forEach((key) => window.localStorage.removeItem(key));
    window.sessionStorage.removeItem(`voiceflex_synced_at_${productType}`);
  } catch {
    // Storage blocked: nothing to clear.
  }
}

/**
 * Save who is training. If a different order or person takes over this device, the previous
 * person's local data is cleared first so it never mixes into the new profile.
 */
export function setTrainingIdentity(productType: VoiceFlexProduct, identity: TrainingIdentity) {
  if (typeof window === "undefined") return;
  // Only a saved identity can hand over to someone else. Data from older app versions stays and is merged up.
  const current = getStoredIdentity(productType);
  if (current && (!sameOrder(current.orderNumber, identity.orderNumber) || current.profileSlot !== identity.profileSlot)) {
    clearPersonalData(productType);
  }
  try {
    window.localStorage.setItem(identityKey(productType), JSON.stringify(identity));
    window.localStorage.setItem(VERIFIED_ORDER_NUMBER_KEY, identity.orderNumber);
  } catch {
    // Storage blocked: the app still works for this visit.
  }
}

export function updateProfileName(productType: VoiceFlexProduct, profileName: string | null) {
  const current = getStoredIdentity(productType);
  if (!current || !profileName || current.profileName === profileName) return;
  try {
    window.localStorage.setItem(identityKey(productType), JSON.stringify({ ...current, profileName }));
  } catch {
    // Ignore.
  }
}

/** Forget who is training (to switch to another person on the same order). */
export function forgetTrainingIdentity(productType: VoiceFlexProduct) {
  if (typeof window === "undefined") return;
  clearPersonalData(productType);
  try {
    window.localStorage.removeItem(identityKey(productType));
  } catch {
    // Ignore.
  }
}
