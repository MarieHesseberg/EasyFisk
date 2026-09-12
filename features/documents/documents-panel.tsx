"use client";
import { selectLocalized } from "@/locales";
import { useState } from "react";
import {
  documentTitles,
  type DocumentKind,
  type FishingDocument,
} from "@/domain/documents/fishing-document";
import { DocumentForm } from "./document-form";
import { DocumentCard } from "./document-card";
import { documentGuidance } from "./document-guidance";
import { useDocuments } from "./use-documents";
import { getDocumentReadiness } from "@/domain/documents/get-document-readiness";
import { useLanguage } from "@/components/localization/language-provider";
export function DocumentsPanel({
  kind,
  testDocument,
  allowManualRegistration = true,
}: {
  kind: DocumentKind;
  testDocument?: FishingDocument | null;
  allowManualRegistration?: boolean;
}) {
  const { language, t } = useLanguage();
  const store = useDocuments();
  const [editing, setEditing] = useState<FishingDocument | "new" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const guidance = documentGuidance[kind];
  const actualDocuments = store.documents.filter((document) => document.kind === kind);
  const hasValidActualDocument = getDocumentReadiness(actualDocuments).valid[kind];
  const isMockView = testDocument !== undefined && testDocument !== null && !hasValidActualDocument;
  const isMissingTest = testDocument === null && !hasValidActualDocument;
  return (
    <section className="documents-panel" aria-label={t(documentTitles[kind])}>
      <p>{t(guidance.text)}</p>
      <a href={guidance.url} target="_blank" rel="noreferrer">
        {t(guidance.link)} ↗
      </a>
      <p className="document-status">
        {t(
          isMockView
            ? "Testmodus – opplysningene nedenfor er mockdata og lagres ikke."
            : isMissingTest
              ? "Testmodus – registrer dokumentet nedenfor for å løse den simulerte mangelen."
              : "Lokal dokumentmappe – ikke en godkjenning. Dokumentene er ikke eksternt verifisert.",
        )}
      </p>
      <p>{t("documents.localStoragePrivacy")}</p>
      {!isMockView && store.loading && <p role="status">{t("copy.henter.dokumenter.8a0c2dc")}</p>}
      {!isMockView && (store.error || error) && (
        <p role="alert">
          {t(store.error || error)}{" "}
          <button onClick={() => void store.reload()}>{t("copy.pr.v.igjen.0a31d71")}</button>
        </p>
      )}
      {message && <p role="status">{t(message)}</p>}
      {isMockView ? (
        <DocumentCard document={testDocument} isMock />
      ) : editing ? (
        <DocumentForm
          key={editing === "new" ? "new" : editing.id}
          kind={kind}
          initial={editing === "new" ? undefined : editing}
          verification={{ method: "manual" }}
          cancel={() => setEditing(null)}
          save={async (document) => {
            const result = await store.save(document);
            if (result.ok) {
              setEditing(null);
              setMessage("documents.manualDocumentSaved");
            }
            return result;
          }}
        />
      ) : allowManualRegistration ? (
        <button
          className="primary"
          onClick={() => {
            setEditing("new");
            setMessage("");
          }}
        >
          {kind === "disinfection"
            ? t("documents.addDisinfectionManually")
            : `${selectLocalized(language, "Registrer", "Register")} ${t(
                documentTitles[kind],
              ).toLocaleLowerCase(selectLocalized(language, "nb", "en"))}`}
        </button>
      ) : null}
      {!isMockView &&
        !store.loading &&
        !store.error &&
        !store.documents.some((document) => document.kind === kind) && (
          <p>{t("copy.ingen.dokumenter.registrert.enna.525214f")}</p>
        )}
      {!isMockView &&
        actualDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            edit={() => {
              setEditing(document);
              setMessage("");
            }}
            remove={async () => {
              const result = await store.remove(document.id);
              if (!result.ok) setError(t(result.error));
              else {
                setError("");
                setMessage("Den lokale kopien er slettet.");
              }
            }}
          />
        ))}
    </section>
  );
}
