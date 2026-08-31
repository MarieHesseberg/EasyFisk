"use client";

import { useState } from "react";
import { documentFields } from "@/domain/documents/document-fields";
import {
  documentAttachmentTypes,
  type DocumentKind,
  type DocumentValues,
  type FishingDocument,
} from "@/domain/documents/fishing-document";
import { attachmentError, validateDocument } from "@/domain/documents/validate-document";
import type { OperationResult } from "@/domain/shared/operation-result";

export function DocumentForm({
  kind,
  initial,
  save,
  cancel,
}: {
  kind: DocumentKind;
  initial?: FishingDocument;
  save: (document: FishingDocument) => Promise<OperationResult<void>>;
  cancel: () => void;
}) {
  const [values, setValues] = useState<DocumentValues>(initial?.values ?? {});
  const [attachment, setAttachment] = useState<Blob | undefined>(initial?.attachment);
  const [attachmentName, setAttachmentName] = useState(initial?.attachmentName);
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
        id: initial?.id ?? crypto.randomUUID(),
        kind,
        values,
        attachment,
        attachmentName,
        updatedAt: Date.now(),
        purchase: initial?.purchase,
      });
      if (!result.ok) setError(result.error);
    } catch {
      setError("Lagring mislyktes. Prøv igjen. Skjemaet er ikke tømt.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="document-form"
      onSubmit={submit}
      aria-label="Registrer dokument"
      aria-busy={saving}
    >
      <fieldset disabled={saving}>
        <legend>{initial ? "Endre registrering" : "Ny registrering"}</legend>
        {documentFields[kind].map((field) => (
          <label key={field.key}>
            {field.label}
            {field.required ? " *" : ""}
            {field.options ? (
              <select
                required={field.required}
                value={values[field.key] ?? ""}
                onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
              >
                <option value="">Velg</option>
                {field.options.map((option) => (
                  <option key={option}>{option}</option>
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
          Bilde eller PDF av originalen (valgfritt, maks 10 MB)
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
          Dokumentet lagres bare i denne nettleseren. Behold originalen et annet sted. Ingen
          automatisk kontroll eller opplasting til en tjeneste.
        </small>
        {fileError && <p role="alert">{fileError}</p>}
        {attachmentName && (
          <p>
            Vedlegg: {attachmentName}{" "}
            <button
              type="button"
              onClick={() => {
                setAttachment(undefined);
                setAttachmentName(undefined);
                setFileError("");
              }}
            >
              Fjern vedlegg
            </button>
          </p>
        )}
        {error && (
          <p id="document-form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" type="submit">
          {saving ? "Lagrer …" : "Lagre dokument"}
        </button>
        <button className="secondary" type="button" onClick={cancel}>
          Avbryt
        </button>
      </fieldset>
    </form>
  );
}
