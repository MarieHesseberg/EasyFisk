import { parseRiverDateTime } from "../shared/river-time.ts";
import type { AccessGrant, FishingDocument } from "./fishing-document.ts";
export function validateAccessGrant(
  parent: FishingDocument,
  grant: AccessGrant,
  ownerEmail: string,
) {
  if (
    parent.kind !== "permit" ||
    parent.values.category !== "Grunneierkort" ||
    !ownerEmail ||
    parent.ownerEmail?.toLowerCase() !== ownerEmail.trim().toLowerCase()
  )
    return "Velg ditt eget grunneierkort.";
  if (
    grant.recipientName.trim().length < 3 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(grant.recipientEmail)
  )
    return "Oppgi navn og e-post på mottakeren.";
  const start = parseRiverDateTime(grant.startsAt),
    end = parseRiverDateTime(grant.endsAt);
  if (
    !Number.isFinite(parseRiverDateTime(parent.values.startsAt ?? "")) ||
    !Number.isFinite(parseRiverDateTime(parent.values.endsAt ?? "")) ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start >= end ||
    start < parseRiverDateTime(parent.values.startsAt ?? "") ||
    end > parseRiverDateTime(parent.values.endsAt ?? "")
  )
    return "Tilgangen må ligge innenfor grunneierkortets gyldighetstid.";
}
export function isAccessGrantActive(parent: FishingDocument, grant: AccessGrant, now: number) {
  return (
    grant.revokedAt === undefined &&
    !validateAccessGrant(parent, grant, parent.ownerEmail ?? "") &&
    parseRiverDateTime(grant.startsAt) <= now &&
    now <= parseRiverDateTime(grant.endsAt) &&
    parseRiverDateTime(parent.values.startsAt ?? "") <= now &&
    now <= parseRiverDateTime(parent.values.endsAt ?? "")
  );
}

export function documentsForLocalProfile(
  documents: FishingDocument[],
  email: string,
  now: number,
): FishingDocument[] {
  const identity = email.trim().toLowerCase();
  return documents.flatMap((parent) => {
    const original = parent.ownerEmail
      ? { ...parent, forOtherPerson: parent.ownerEmail.toLowerCase() !== identity }
      : parent;
    const guests = (parent.accessGrants ?? [])
      .filter(
        (grant) =>
          identity &&
          grant.role === "guest" &&
          grant.recipientEmail.toLowerCase() === identity &&
          grant.revokedAt === undefined &&
          !validateAccessGrant(parent, grant, parent.ownerEmail ?? "") &&
          (isAccessGrantActive(parent, grant, now) || now < parseRiverDateTime(grant.startsAt)),
      )
      .map((grant) => ({
        id: `guest-access-${grant.id}`,
        kind: "permit" as const,
        zoneId: parent.zoneId,
        productId: parent.productId,
        rulesVersion: parent.rulesVersion,
        updatedAt: grant.createdAt,
        derivedAccess: true,
        values: {
          ...parent.values,
          holder: grant.recipientName,
          category: "Annet",
          startsAt: grant.startsAt,
          endsAt: grant.endsAt,
          reference: grant.id,
        },
      }));
    return [original, ...guests];
  });
}
