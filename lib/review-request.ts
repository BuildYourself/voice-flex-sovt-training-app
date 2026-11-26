import type { VoiceFlexProduct } from "@/lib/training-product";

/**
 * Review request, kept inside Amazon's rules:
 * - the same neutral ask for everyone, never only for happy users
 * - no "contact us first", no rating question before the link
 * - no reward, discount or unlock tied to leaving a review
 * The link opens Amazon's own review form for the ASIN the buyer ordered.
 */

/** Used when the order's own ASIN isn't known on this device yet. */
const FALLBACK_ASIN: Record<VoiceFlexProduct, string> = {
  pro: "B0FZVBL3JX",
  go: "B0H299R3KN",
  core: "B0HFRD6FF4",
};

const ASIN_PATTERN = /^B0[A-Z0-9]{8}$/;

/** Ask in the "routine complete" window once the user has finished this many routines. */
export const REVIEW_MODAL_AFTER_ROUTINES = 2;

/** After "Not now", stay quiet for this long. A click on the link hides it for good. */
const SNOOZE_DAYS = 30;

type ReviewState = { clickedAt?: string; snoozedAt?: string };

function asinKey(productType: VoiceFlexProduct) {
  return `voiceflex_order_asin_${productType}`;
}

function stateKey(productType: VoiceFlexProduct) {
  return `voiceflex_review_request_${productType}`;
}

/** Website (Shopify) order numbers look like SY1006. */
const WEBSITE_ORDER_PATTERN = /^#?\s*SY\s*\d+$/i;

function sourceKey(productType: VoiceFlexProduct) {
  return `voiceflex_order_source_${productType}`;
}

/**
 * Website buyers didn't order on Amazon, so they never get the Amazon review ask.
 * Called on every order check, so an Amazon order verified later on the same device turns it back on.
 */
export function setOrderSource(productType: VoiceFlexProduct, orderNumber: string | null | undefined) {
  if (typeof window === "undefined") return;
  const source = WEBSITE_ORDER_PATTERN.test((orderNumber ?? "").trim()) ? "website" : "amazon";
  try {
    window.localStorage.setItem(sourceKey(productType), source);
  } catch {
    // Storage blocked: treated as an Amazon order.
  }
}

function isWebsiteOrder(productType: VoiceFlexProduct) {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(sourceKey(productType)) === "website";
  } catch {
    return false;
  }
}

export function setOrderAsin(productType: VoiceFlexProduct, asin: string | null | undefined) {
  if (typeof window === "undefined") return;
  const value = (asin ?? "").trim().toUpperCase();
  if (!ASIN_PATTERN.test(value)) return;
  try {
    window.localStorage.setItem(asinKey(productType), value);
  } catch {
    // Storage blocked: the fallback ASIN is used.
  }
}

export function getReviewUrl(productType: VoiceFlexProduct) {
  let asin = FALLBACK_ASIN[productType];
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(asinKey(productType));
      if (stored && ASIN_PATTERN.test(stored)) asin = stored;
    } catch {
      // Use the fallback.
    }
  }
  return `https://www.amazon.com/review/create-review?asin=${asin}`;
}

function readState(productType: VoiceFlexProduct): ReviewState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(stateKey(productType));
    return raw ? (JSON.parse(raw) as ReviewState) : {};
  } catch {
    return {};
  }
}

function writeState(productType: VoiceFlexProduct, state: ReviewState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(stateKey(productType), JSON.stringify(state));
  } catch {
    // Ignore.
  }
}

export function shouldShowReviewRequest(productType: VoiceFlexProduct, now = new Date()) {
  if (isWebsiteOrder(productType)) return false;
  const state = readState(productType);
  if (state.clickedAt) return false;
  if (state.snoozedAt) {
    const snoozed = new Date(state.snoozedAt).getTime();
    if (Number.isFinite(snoozed) && now.getTime() - snoozed < SNOOZE_DAYS * 24 * 60 * 60 * 1000) return false;
  }
  return true;
}

export function markReviewClicked(productType: VoiceFlexProduct) {
  writeState(productType, { ...readState(productType), clickedAt: new Date().toISOString() });
}

export function snoozeReviewRequest(productType: VoiceFlexProduct) {
  writeState(productType, { ...readState(productType), snoozedAt: new Date().toISOString() });
}
