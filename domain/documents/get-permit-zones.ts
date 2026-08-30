import type { FishingDocument } from "./fishing-document.ts";
import type { ZoneId } from "../zones/zone.ts";

export function getPermitZoneId(document: FishingDocument): ZoneId | undefined {
  if (document.kind !== "permit") return undefined;
  const match = document.values.area?.match(/\bSone\s+([1-4])\b/i);
  return match ? (Number(match[1]) as ZoneId) : undefined;
}

export function isPermitValid(document: FishingDocument, now = Date.now()) {
  if (document.kind !== "permit") return false;
  const startsAt = new Date(document.values.startsAt ?? "").getTime();
  const endsAt = new Date(document.values.endsAt ?? "").getTime();
  return startsAt <= now && endsAt >= now;
}

export function getValidPermitZoneIds(documents: FishingDocument[], now = Date.now()) {
  return Array.from(
    new Set(
      documents
        .filter((document) => isPermitValid(document, now))
        .map(getPermitZoneId)
        .filter((zoneId): zoneId is ZoneId => zoneId !== undefined),
    ),
  );
}
