export const ACTIVE_PRODUCT_KEY = "voiceflex_active_product";

export type VoiceFlexProduct = "pro" | "go";

export function isVoiceFlexProduct(value: unknown): value is VoiceFlexProduct {
  return value === "pro" || value === "go";
}

export function getActiveProduct(): VoiceFlexProduct | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(ACTIVE_PRODUCT_KEY);
  return isVoiceFlexProduct(value) ? value : null;
}

export function setActiveProduct(product: VoiceFlexProduct) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_PRODUCT_KEY, product);
}

export function clearActiveProduct() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACTIVE_PRODUCT_KEY);
}

export function isTrainingRoute(pathname: string) {
  return pathname === "/train" || pathname.startsWith("/train/");
}
