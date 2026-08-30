import type { DocumentKind, FishingDocument } from "./fishing-document.ts";
import type { ZoneId } from "../zones/zone.ts";
import { getPermitZoneId, isPermitValid } from "./get-permit-zones.ts";

export interface DocumentReadiness {
  complete: boolean;
  valid: Record<DocumentKind, boolean>;
  missingLabels: string[];
}

const labels: Record<DocumentKind, string> = {
  permit: "gyldig fiskekort",
  disinfection: "gyldig desinfisering",
  fee: "fiskeravgift eller registrert fritak",
};

function norwegianYear(now: number) {
  return new Intl.DateTimeFormat("nb-NO", { year: "numeric", timeZone: "Europe/Oslo" }).format(now);
}

export function getDocumentReadiness(
  documents: FishingDocument[],
  now = Date.now(),
  requiredZone?: ZoneId,
): DocumentReadiness {
  const valid = {
    permit: documents.some(
      (document) =>
        isPermitValid(document, now) &&
        (requiredZone === undefined || getPermitZoneId(document) === requiredZone),
    ),
    disinfection: documents.some((document) => {
      if (document.kind !== "disinfection" || document.values.otherRiverAt) return false;
      const performedAt = new Date(document.values.performedAt ?? "").getTime();
      return performedAt <= now && performedAt + 20 * 24 * 60 * 60 * 1000 >= now;
    }),
    fee: documents.some(
      (document) => document.kind === "fee" && document.values.year === norwegianYear(now),
    ),
  };
  const kinds = Object.keys(valid) as DocumentKind[];
  const missingLabels = kinds.filter((kind) => !valid[kind]).map((kind) => labels[kind]);
  return { complete: missingLabels.length === 0, valid, missingLabels };
}
