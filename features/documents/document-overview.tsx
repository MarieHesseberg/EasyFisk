"use client";

import { documentTitles, type DocumentKind } from "@/domain/documents/fishing-document";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { useDocuments } from "./use-documents";
import { getDocumentReadiness } from "@/domain/documents/get-document-readiness";

const destinations: Record<DocumentKind, DetailDestination> = {
  permit: "permits",
  disinfection: "disinfection",
  fee: "fee",
};
const kinds: DocumentKind[] = ["permit", "disinfection", "fee"];

export function DocumentOverview({ open }: { open: (destination: DetailDestination) => void }) {
  const { documents, loading, error } = useDocuments();
  const readiness = getDocumentReadiness(documents);
  return (
    <div className="document-overview">
      {error && <p role="alert">{error}</p>}
      {kinds.map((kind) => {
        const count = documents.filter((document) => document.kind === kind).length;
        return (
          <button key={kind} onClick={() => open(destinations[kind])}>
            <span>
              <b>{documentTitles[kind]}</b>
              <small>
                {loading
                  ? "Henter …"
                  : error
                    ? "Kunne ikke lese lagring"
                    : count
                      ? readiness.valid[kind]
                        ? `${count} registrert · gyldig tidsrom · ikke verifisert`
                        : `${count} registrert · utløpt eller må fornyes`
                      : "Ingen registrert – legg til dokumentasjon"}
              </small>
            </span>
            <span aria-hidden="true">＋</span>
          </button>
        );
      })}
    </div>
  );
}
