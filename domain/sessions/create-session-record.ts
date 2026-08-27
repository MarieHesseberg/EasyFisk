import type { SessionRecord } from "./session";

export function createSessionRecord(
  start: number,
  end: number,
  zone: string,
  result: string,
): SessionRecord {
  return {
    start,
    end,
    duration: Math.max(1, Math.floor((end - start) / 1000)),
    zone,
    result,
  };
}
