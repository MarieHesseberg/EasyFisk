"use client";
import { selectLocalized } from "@/locales";
import { useState } from "react";
import {
  documentTitles,
  type DocumentKind,
  type FishingDocument,
} from "@/domain/documents/fishing-document";
import { DocumentPracticalInformation } from "./document-practical-information";
import { DocumentForm } from "./document-form";
import { DocumentCard } from "./document-card";
import { documentGuidance } from "./document-guidance";
import { useDocuments } from "./use-documents";
import { getDocumentReadiness } from "@/domain/documents/get-document-readiness";
import { useLanguage } from "@/components/localization/language-provider";
export function DocumentsPanel({
  kind,
  testDocument,
  allowManualRegistration = kind !== "permit",
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
  const compact = kind !== "permit";
  const actualDocuments = store.documents.filter((document) => document.kind === kind);
  const hasValidActualDocument = getDocumentReadiness(actualDocuments).valid[kind];
  const isMockView = testDocument !== undefined && testDocument !== null && !hasValidActualDocument;
  return (
    <section
      className={`documents-panel${compact ? " documents-panel-simple" : ""}`}
      aria-label={t(documentTitles[kind])}
    >
      {compact ? (
        <p className="document-intro">
          {kind === "fee"
            ? selectLocalized(
                language,
                "Legg til kvitteringen for betalt fiskeravgift.",
                "Add the receipt for your paid fishing fee.",
              )
            : selectLocalized(
                language,
                "Legg til beviset du fikk da utstyret ble desinfisert.",
                "Add the certificate you received when your equipment was disinfected.",
              )}
        </p>
      ) : (
        <p>{t(guidance.text)}</p>
      )}
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
      <a className="document-resource-link" href={guidance.url} target="_blank" rel="noreferrer">
        {compact
          ? kind === "fee"
            ? selectLocalized(language, "Betal avgift / hent kvittering", "Pay fee / get receipt")
            : selectLocalized(language, "Finn desinfiseringssted", "Find a disinfection station")
          : t(guidance.link)}{" "}
        ↗
      </a>
      <details className="document-more-information">
        <summary>{selectLocalized(language, "Mer informasjon", "More information")}</summary>
        {kind === "fee" || kind === "disinfection" ? (
          <DocumentPracticalInformation kind={kind} />
        ) : (
          <>
            <p>{t("content.edde3c5a4756")}</p>
            <p>{t("documents.localStoragePrivacy")}</p>
          </>
        )}
      </details>
    </section>
  );
}
