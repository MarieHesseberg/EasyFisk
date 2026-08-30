"use client";

import { useEffect, useMemo, useState } from "react";
import { documentFields } from "@/domain/documents/document-fields";
import type { FishingDocument } from "@/domain/documents/fishing-document";

export function DocumentCard({
  document,
  edit,
  remove,
}: {
  document: FishingDocument;
  edit: () => void;
  remove: () => Promise<void>;
}) {
  const url = useMemo(
    () => (document.attachment ? URL.createObjectURL(document.attachment) : ""),
    [document.attachment],
  );
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);
  return (
    <article className="document-card">
      <h3>{document.values.holder}</h3>
      <p className="document-status">Egenregistrert · ikke eksternt verifisert</p>
      <dl>
        {documentFields[document.kind]
          .filter((field) => document.values[field.key])
          .map((field) => (
            <div key={field.key}>
              <dt>{field.label}</dt>
              <dd>{document.values[field.key]?.replace("T", " kl. ")}</dd>
            </div>
          ))}
      </dl>
      {document.kind === "disinfection" && document.values.otherRiverAt && (
        <p role="status">Besøk i annet vassdrag er registrert. Utstyret må desinfiseres på nytt.</p>
      )}
      {url ? (
        <a href={url} download={document.attachmentName}>
          Last ned originalvedlegg: {document.attachmentName}
        </a>
      ) : (
        <p>Ingen kopi vedlagt. Ta med original dokumentasjon.</p>
      )}
      <button className="secondary" onClick={edit}>
        Endre opplysninger
      </button>
      {confirm ? (
        <div>
          <p>Slette denne lokale kopien? Originalen hos utsteder endres ikke.</p>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await remove();
              setBusy(false);
              setConfirm(false);
            }}
          >
            Ja, slett lokal kopi
          </button>
          <button onClick={() => setConfirm(false)}>Behold</button>
        </div>
      ) : (
        <button onClick={() => setConfirm(true)}>Slett lokal kopi</button>
      )}
    </article>
  );
}
