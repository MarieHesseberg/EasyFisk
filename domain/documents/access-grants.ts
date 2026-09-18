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
  const start = Date.parse(grant.startsAt),
    end = Date.parse(grant.endsAt);
  if (
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    start >= end ||
    start < Date.parse(parent.values.startsAt ?? "") ||
    end > Date.parse(parent.values.endsAt ?? "")
  )
    return "Tilgangen må ligge innenfor grunneierkortets gyldighetstid.";
}
export function isAccessGrantActive(parent: FishingDocument, grant: AccessGrant, now: number) {
  return (
    !grant.revokedAt &&
    !validateAccessGrant(parent, grant, parent.ownerEmail ?? "") &&
    Date.parse(grant.startsAt) <= now &&
    now <= Date.parse(grant.endsAt) &&
    Date.parse(parent.values.startsAt ?? "") <= now &&
    now <= Date.parse(parent.values.endsAt ?? "")
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
          !grant.revokedAt &&
          !validateAccessGrant(parent, grant, parent.ownerEmail ?? "") &&
          (isAccessGrantActive(parent, grant, now) || now < Date.parse(grant.startsAt)),
      )
      .map((grant) => ({
        id: `guest-access-${grant.id}`,
        kind: "permit" as const,
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
