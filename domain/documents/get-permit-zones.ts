import { zoneIdFromLegacyLabel } from "../zones/zone-identity.ts";
import { parseRiverDateTime } from "../shared/river-time.ts";
import { getAppNow } from "../shared/app-clock.ts";
import type { FishingDocument } from "./fishing-document.ts";
import type { ZoneId } from "../zones/zone.ts";

export function getPermitZoneId(document: FishingDocument): ZoneId | undefined {
  if (document.kind !== "permit") return undefined;
  return document.zoneId ?? zoneIdFromLegacyLabel(document.values.area);
}

export function isPermitValid(document: FishingDocument, now = getAppNow()) {
  if (document.kind !== "permit" || document.forOtherPerson) return false;
  const startsAt = parseRiverDateTime(document.values.startsAt ?? "");
  const endsAt = parseRiverDateTime(document.values.endsAt ?? "");
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
      Number.isFinite(parseRiverDateTime(document.values.startsAt ?? "")) &&
      Number.isFinite(parseRiverDateTime(document.values.endsAt ?? "")),
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
