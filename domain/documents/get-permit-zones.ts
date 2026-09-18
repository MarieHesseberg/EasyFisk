import { getAppNow } from "../shared/app-clock.ts";
import type { FishingDocument } from "./fishing-document.ts";
import type { ZoneId } from "../zones/zone.ts";

export function getPermitZoneId(document: FishingDocument): ZoneId | undefined {
  if (document.kind !== "permit") return undefined;
  const match = document.values.area?.match(/\bSone\s+([1-4])\b/i);
  return match ? (Number(match[1]) as ZoneId) : undefined;
}

export function isPermitValid(document: FishingDocument, now = getAppNow()) {
  if (document.kind !== "permit" || document.forOtherPerson) return false;
  const startsAt = new Date(document.values.startsAt ?? "").getTime();
  const endsAt = new Date(document.values.endsAt ?? "").getTime();
  return startsAt <= now && endsAt >= now;
}

/** Display an owned permit even outside its validity period, without granting fishing readiness. */
export function getDisplayedPermit(
  documents: FishingDocument[],
  now: number,
  preferredZone?: ZoneId,
) {
  const permits = documents.filter(
    (document) =>
      !document.forOtherPerson &&
      getPermitZoneId(document) !== undefined &&
      Number.isFinite(Date.parse(document.values.startsAt ?? "")) &&
      Number.isFinite(Date.parse(document.values.endsAt ?? "")),
  );
  const current = permits.filter((document) => isPermitValid(document, now));
  const candidates = current.length ? current : permits;
  return [...candidates].sort(
    (a, b) =>
      (current.length
        ? Number(getPermitZoneId(b) === preferredZone) -
          Number(getPermitZoneId(a) === preferredZone)
        : 0) || b.updatedAt - a.updatedAt,
  )[0];
}

export function getValidPermitZoneIds(documents: FishingDocument[], now = getAppNow()) {
  return Array.from(
    new Set(
      documents
        .filter((document) => isPermitValid(document, now))
        .map(getPermitZoneId)
        .filter((zoneId): zoneId is ZoneId => zoneId !== undefined),
    ),
  );
}
