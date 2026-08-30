"use client";

import { documentTitles, type DocumentKind } from "@/domain/documents/fishing-document";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { useDocuments } from "./use-documents";
import { getDocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";

const destinations: Record<DocumentKind, DetailDestination> = {
  permit: "permits",
  disinfection: "disinfection",
  fee: "fee",
};
const kinds: DocumentKind[] = ["permit", "disinfection", "fee"];
const mockSummaries: Record<DocumentKind, string> = {
  permit: "Testdata · Døgnkort for sone 3 · gyldig i dag",
  disinfection: "Testdata · attest registrert i dag · gyldig i 20 dager",
  fee: "Testdata · fiskeravgift betalt for 2026",
};

export function DocumentOverview({
  open,
  testReadiness,
}: {
  open: (destination: DetailDestination) => void;
  testReadiness?: DocumentReadiness;
}) {
  const { documents, loading, error } = useDocuments();
  const actualReadiness = getDocumentReadiness(documents);
  return (
    <div className="document-overview">
      {error && <p role="alert">{error}</p>}
      {kinds.map((kind) => {
        const count = documents.filter((document) => document.kind === kind).length;
        const isTestData = testReadiness !== undefined;
        const isValid = isTestData ? testReadiness.valid[kind] : actualReadiness.valid[kind];
        return (
          <button key={kind} onClick={() => open(destinations[kind])}>
            <span>
              <b>{documentTitles[kind]}</b>
              <small>
                {isTestData
                  ? isValid
                    ? mockSummaries[kind]
                    : "Testdata · mangler eller er ikke gyldig"
                  : loading
                    ? "Henter …"
                    : error
                      ? "Kunne ikke lese lagring"
                      : count
                        ? actualReadiness.valid[kind]
                          ? `${count} registrert · gyldig tidsrom · ikke verifisert`
                          : `${count} registrert · utløpt eller må fornyes`
                        : "Ingen registrert – legg til dokumentasjon"}
              </small>
            </span>
            <span aria-hidden="true">{isTestData && isValid ? "✓" : "＋"}</span>
          </button>
        );
      })}
    </div>
  );
}
