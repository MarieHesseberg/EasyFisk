"use client";
import { selectLocalized } from "@/locales";
import {
  documentTitles,
  type DocumentKind,
  type FishingDocument,
} from "@/domain/documents/fishing-document";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { useDocuments } from "./use-documents";
import { getDocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import { useLanguage } from "@/components/localization/language-provider";
const destinations: Record<DocumentKind, DetailDestination> = {
  permit: "permits",
  disinfection: "disinfection",
  fee: "fee",
};
const kinds: DocumentKind[] = ["permit", "disinfection", "fee"];
const mockSummaries: Record<DocumentKind, string> = {
  permit: "Døgnkort for sone 3 · gyldig i dag",
  disinfection: "attest registrert i dag · gyldig i 20 dager",
  fee: "fiskeravgift betalt for 2026",
};
function documentSummary(kind: DocumentKind, documents: FishingDocument[], language: "no" | "en") {
  const document = documents
    .filter((entry) => entry.kind === kind)
    .sort((left, right) => (right.values.endsAt ?? "").localeCompare(left.values.endsAt ?? ""))[0];
  if (kind !== "permit" || !document) return undefined;
  const validUntil = new Intl.DateTimeFormat(selectLocalized(language, "nb-NO", "en-GB"), {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Oslo",
  }).format(new Date(document.values.endsAt ?? ""));
  return selectLocalized(
    language,
    `${document.values.area} · gyldig til ${validUntil}`,
    `${document.values.area} · valid until ${validUntil}`,
  );
}
export function DocumentOverview({
  open,
  testReadiness,
  readiness,
}: {
  open: (destination: DetailDestination) => void;
  testReadiness?: DocumentReadiness;
  readiness?: DocumentReadiness;
}) {
  const { language, t } = useLanguage();
  const { documents, loading, error } = useDocuments();
  const actualReadiness = readiness && !testReadiness ? readiness : getDocumentReadiness(documents);
  return (
    <div className="document-overview">
      {error && <p role="alert">{t(error)}</p>}
      {kinds.map((kind) => {
        const count = documents.filter((document) => document.kind === kind).length;
        const summary = documentSummary(kind, documents, language);
        const isTestData = testReadiness !== undefined && !actualReadiness.valid[kind];
        const isValid = isTestData ? testReadiness.valid[kind] : actualReadiness.valid[kind];
        return (
          <button key={kind} onClick={() => open(destinations[kind])}>
            <span>
              <b>{t(documentTitles[kind])}</b>
              <small>
                {isTestData
                  ? isValid
                    ? t(mockSummaries[kind])
                    : t("content.bf8faf47403a")
                  : loading
                    ? t("content.406e73d3b7a5")
                    : error
                      ? t("content.abb94ff6057f")
                      : count
                        ? actualReadiness.valid[kind]
                          ? (summary ??
                            selectLocalized(
                              language,
                              `${count} registrert · gyldig tidsrom · ikke verifisert`,
                              `${count} registered · valid period · not verified`,
                            ))
                          : selectLocalized(
                              language,
                              `${count} registrert · utløpt eller må fornyes`,
                              `${count} registered · expired or must be renewed`,
                            )
                        : kind === "permit"
                          ? t("documents.noPermitPurchased")
                          : t("content.6ff5ce507757")}
              </small>
            </span>
            <span aria-hidden="true">
              {isTestData && isValid ? "✓" : kind === "permit" ? "›" : "＋"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
