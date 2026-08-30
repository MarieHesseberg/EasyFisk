"use client";

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

export function DocumentsPanel({ kind }: { kind: DocumentKind }) {
  const store = useDocuments();
  const [editing, setEditing] = useState<FishingDocument | "new" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const guidance = documentGuidance[kind];
  return (
    <section className="documents-panel" aria-label={documentTitles[kind]}>
      <p>{guidance.text}</p>
      <a href={guidance.url} target="_blank" rel="noreferrer">
        {guidance.link} ↗
      </a>
      <p className="document-status">
        Lokal dokumentmappe – ikke en godkjenning. Statusmotoren er fortsatt en separat
        demonstrasjon.
      </p>
      <p>
        Opplysningene og eventuelle vedlegg lagres ukryptert i denne nettleseren. Andre som bruker
        samme nettleserprofil kan se dem, og sletting av nettleserdata kan fjerne dem.
      </p>
      {store.loading && <p role="status">Henter dokumenter …</p>}
      {(store.error || error) && (
        <p role="alert">
          {store.error || error} <button onClick={() => void store.reload()}>Prøv igjen</button>
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {editing ? (
        <DocumentForm
          key={editing === "new" ? "new" : editing.id}
          kind={kind}
          initial={editing === "new" ? undefined : editing}
          cancel={() => setEditing(null)}
          save={async (document) => {
            const result = await store.save(document);
            if (result.ok) {
              setEditing(null);
              setMessage("Dokumentet er lagret på denne enheten. Ikke eksternt verifisert.");
            }
            return result;
          }}
        />
      ) : (
        <button
          className="primary"
          onClick={() => {
            setEditing("new");
            setMessage("");
          }}
        >
          Registrer {documentTitles[kind].toLowerCase()}
        </button>
      )}
      {!store.loading &&
        !store.error &&
        !store.documents.some((document) => document.kind === kind) && (
          <p>Ingen dokumenter registrert ennå.</p>
        )}
      {store.documents
        .filter((document) => document.kind === kind)
        .map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            edit={() => {
              setEditing(document);
              setMessage("");
            }}
            remove={async () => {
              const result = await store.remove(document.id);
              if (!result.ok) setError(result.error);
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
