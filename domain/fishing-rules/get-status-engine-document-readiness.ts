import type { DocumentKind } from "../documents/fishing-document.ts";
import type { DocumentReadiness } from "../documents/get-document-readiness.ts";
import type { DemoStatus } from "./rule.ts";

const labels: Record<DocumentKind, string> = {
  permit: "fiskekort",
  disinfection: "desinfisering",
  fee: "fiskeravgift",
};

export function getStatusEngineDocumentReadiness(status: DemoStatus): DocumentReadiness {
  const valid: Record<DocumentKind, boolean> = {
    permit: true,
    disinfection: true,
    fee: true,
  };

  if (status === "allMissing") {
    valid.permit = false;
    valid.disinfection = false;
    valid.fee = false;
  } else if (status === "noPermit" || status === "wrongZone") {
    valid.permit = false;
  } else if (status === "expiredDisinfection" || status === "otherRiver") {
    valid.disinfection = false;
  } else if (status === "noFee") {
    valid.fee = false;
  }

  const kinds = Object.keys(valid) as DocumentKind[];
  const missingLabels = kinds.filter((kind) => !valid[kind]).map((kind) => labels[kind]);
  return { complete: missingLabels.length === 0, valid, missingLabels };
}
