import { riverDate, riverDateTime } from "./river-time.ts";
export type AppClock = { now(): number };
export const systemClock: AppClock = { now: () => Date.now() };
let clock: AppClock = systemClock;
/** Configure once at the application boundary; tests can restore their previous clock. */
export function configureAppClock(next: AppClock) {
  const previous = clock;
  clock = next;
  return () => {
    clock = previous;
  };
}
export function getAppNow() {
  return clock.now();
}

export function getAppDate(now = getAppNow()) {
  return riverDate(now);
}
export function getAppDateTime(now = getAppNow()) {
  return riverDateTime(now).slice(0, 16);
}
