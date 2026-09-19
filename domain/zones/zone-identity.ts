import type { ZoneId } from "./zone.ts";
export function isZoneId(value: unknown): value is ZoneId {
  return value === 1 || value === 2 || value === 3 || value === 4;
}
/** Bare for eldre data og manuelle fritekstdokumenter; nye utstedte kort har zoneId. */
export function zoneIdFromLegacyLabel(label: string | undefined): ZoneId | undefined {
  const match = label?.match(/\bSone\s+([1-4])\b/i);
  return match ? (Number(match[1]) as ZoneId) : undefined;
}
