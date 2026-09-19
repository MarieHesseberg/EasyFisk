import type { ZoneId } from "../zones/zone.ts";
import { createId } from "../shared/create-id.ts";
import { zoneIdFromLegacyLabel } from "../zones/zone-identity.ts";
import type { SessionRecord } from "./session";

export function createSessionRecord(
  start: number,
  end: number,
  zone: string,
  result: string,
  subzone?: string,
  id = `EF-OKT-${createId()}`,
  zoneId: ZoneId | undefined = zoneIdFromLegacyLabel(zone),
): SessionRecord {
  return {
    id,
    zoneId,
    start,
    end,
    duration: Math.max(1, Math.floor((end - start) / 1000)),
    zone,
    result,
    ...(subzone ? { subzone } : {}),
  };
}
