"use client";
import { DraftScope, DraftControls, useDraft, useDraftState } from "@/hooks/use-draft";
import { getAppNow, getAppDate, getAppDateTime } from "@/domain/shared/app-clock";

import { createLocalId } from "@/lib/create-local-id";
import { useState } from "react";
import { documentFields } from "@/domain/documents/document-fields";
import {
  documentAttachmentTypes,
  type DocumentKind,
  type DocumentValues,
  type FishingDocument,
  type DocumentVerification,
} from "@/domain/documents/fishing-document";
import { attachmentError, validateDocument } from "@/domain/documents/validate-document";
import type { OperationResult } from "@/domain/shared/operation-result";
import { useLanguage } from "@/components/localization/language-provider";
import { localizeDocumentError } from "@/lib/localize-document-error";
function DocumentFormContent({
  kind,
  initial,
  save,
  cancel,
  verification,
}: {
  kind: DocumentKind;
  initial?: FishingDocument;
  save: (document: FishingDocument) => Promise<OperationResult<void>>;
  cancel: () => void;
  verification?: DocumentVerification;
}) {
  const draft = useDraft();
  const { language, t } = useLanguage();
  const [values, setValues] = useDraftState<DocumentValues>(
    "values",
    initial?.values ??
      (kind === "fee"
        ? { year: getAppDate().slice(0, 4), paidAt: getAppDate() }
        : kind === "disinfection"
          ? { performedAt: getAppDateTime() }
          : {}),
  );
  const [attachment, setAttachment] = useDraftState<Blob | undefined>(
    "attachment",
    initial?.attachment,
  );
  const [attachmentName, setAttachmentName] = useDraftState(
    "attachmentName",
    initial?.attachmentName,
  );
  const [error, setError] = useState("");
  const [fileError, setFileError] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    const problem = validateDocument(kind, values) ?? fileError;
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    try {
      const result = await save({
        id: initial?.id ?? createLocalId(),
        kind,
        values,
        attachment,
        attachmentName,
        updatedAt: getAppNow(),
        purchaseId: initial?.purchaseId,
        verification: initial?.verification ?? verification ?? { method: "manual" },
      });
      if (!result.ok) setError(t(result.error));
      else await draft?.complete();
    } catch {
      setError("error.storage.write");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      className="document-form"
      onSubmit={submit}
      aria-label={t("copy.registrer.dokument.40d160f")}
      aria-busy={saving}
    >
      <DraftControls disabled={saving} />
      <fieldset disabled={saving}>
        <legend>{initial ? t("content.d3b307e58e8b") : t("content.85d2c744960e")}</legend>
        {documentFields[kind].map((field) => (
          <label key={field.key}>
            {t(field.label)}
            {field.required ? " *" : ""}
            {field.options ? (
              <select
                required={field.required}
                value={values[field.key] ?? ""}
                onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
              >
                <option value="">{t("copy.velg.c8aa94e")}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {t(option)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type ?? "text"}
                required={field.required}
                maxLength={500}
                value={values[field.key] ?? ""}
                onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                aria-describedby={error ? "document-form-error" : undefined}
              />
            )}
          </label>
        ))}
        <label>
          {t("copy.bilde.eller.pdf.av.originalen.valgfritt.maks.10..78250f0")}
          <input
            type="file"
            accept={documentAttachmentTypes.join(",")}
            aria-describedby="document-file-help"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              const problem = attachmentError(file);
              setFileError(problem ?? "");
              if (!problem) {
                setAttachment(file);
                setAttachmentName(file.name);
              }
            }}
          />
        </label>
        <small id="document-file-help">
          {t("copy.dokumentet.lagres.bare.i.denne.nettleseren.behol.12aaafe")}
        </small>
        {fileError && <p role="alert">{t(fileError)}</p>}
        {attachmentName && (
          <p>
            {t("copy.vedlegg.2a65263")}: {attachmentName}{" "}
            <button
              type="button"
              onClick={() => {
                setAttachment(undefined);
                setAttachmentName(undefined);
                setFileError("");
              }}
            >
              {t("copy.fjern.vedlegg.ab8a6da")}
            </button>
          </p>
        )}
        {error && (
          <p id="document-form-error" role="alert">
            {localizeDocumentError(error, language)}
          </p>
        )}
        <button className="primary" type="submit">
          {saving ? t("copy.lagrer.85686f0") : t("content.adf1599d9df7")}
        </button>
        <button className="secondary" type="button" onClick={cancel}>
          {t("copy.avbryt.d10c9f7")}
        </button>
      </fieldset>
    </form>
  );
}

export function DocumentForm(props: Parameters<typeof DocumentFormContent>[0]) {
  const id = `document:${props.kind}:${props.initial?.id ?? "new"}`;
  return (
    <DraftScope key={id} id={id}>
      <DocumentFormContent {...props} />
    </DraftScope>
  );
}
