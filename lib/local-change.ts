/** Fired when a setting that follows the user changes on this device, so it can be saved to their account. */
export const LOCAL_CHANGE_EVENT = "voiceflex:local-change";

export function notifyLocalChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
}
