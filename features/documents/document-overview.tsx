"use client";

import { documentTitles, type DocumentKind } from "@/domain/documents/fishing-document";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { useDocuments } from "./use-documents";

const destinations: Record<DocumentKind, DetailDestination> = {
  permit: "permits",
  disinfection: "disinfection",
  fee: "fee",
};
const kinds: DocumentKind[] = ["permit", "disinfection", "fee"];

export function DocumentOverview({ open }: { open: (destination: DetailDestination) => void }) {
  const { documents, loading, error } = useDocuments();
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
                      ? `${count} egenregistrert · ikke verifisert`
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
