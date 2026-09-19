/** Shared demo clock: starts during the open 2026 season and keeps running across reloads. */
export const appClockStart = Date.parse("2026-08-20T18:05:00+02:00");
export const appClockStorageKey = "easyfisk-clock-v1";
let fallbackAnchor: number | undefined;

export function demoNow() {
  const realNow = Date.now();
  // Server rendering starts at the same scenario time as a new browser.
  if (typeof window === "undefined") return appClockStart;
  let anchor = fallbackAnchor ?? realNow;
  try {
    const stored = window.localStorage.getItem(appClockStorageKey);
    const parsed = stored === null ? NaN : Number(stored);
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= realNow) anchor = parsed;
    else window.localStorage.setItem(appClockStorageKey, String(anchor));
  } catch {
    // Storage failures must not prevent the app from using a consistent clock.
  }
  fallbackAnchor = anchor;
  return appClockStart + Math.max(0, realNow - anchor);
}
