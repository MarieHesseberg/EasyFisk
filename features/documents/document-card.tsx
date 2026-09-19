"use client";
import { selectLocalized } from "@/locales";
import { useEffect, useMemo, useState } from "react";
import { documentFields } from "@/domain/documents/document-fields";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { useLanguage } from "@/components/localization/language-provider";
export function DocumentCard({
  document,
  edit,
  remove,
  isMock = false,
}: {
  document: FishingDocument;
  edit?: () => void;
  remove?: () => Promise<void>;
  isMock?: boolean;
}) {
  const { language, t } = useLanguage();
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
    <article className="document-card" data-kind={document.kind}>
      <h3>{document.values.holder}</h3>
      {document.forOtherPerson && (
        <p>
          {selectLocalized(
            language,
            "Kortet gjelder en annen fisker.",
            "This permit belongs to another angler.",
          )}
        </p>
      )}
      <p className="document-status">
        {isMock
          ? t("content.d31c8b0c7d5d")
          : document.verification?.method === "disinfector-approved"
            ? t("documents.disinfectorApproved", {
                name: document.verification.verifierName,
              })
            : document.verification?.method === "permit-purchase"
              ? t("documents.issuedInApp")
              : t("content.211ece693265")}
      </p>
      {document.verification?.method === "disinfector-approved" && (
        <p>{t("documents.approverRole", { role: document.verification.verifierRole })}</p>
      )}
      <dl>
        {documentFields[document.kind]
          .filter((field) => document.values[field.key])
          .map((field) => (
            <div key={field.key}>
              <dt>{t(field.label)}</dt>
              <dd>
                {field.type === "datetime-local"
                  ? document.values[field.key]?.replace(
                      "T",
                      selectLocalized(language, " kl. ", " at "),
                    )
                  : field.options
                    ? t(document.values[field.key] ?? "")
                    : document.values[field.key]}
              </dd>
            </div>
          ))}
      </dl>
      {document.kind === "disinfection" && document.values.otherRiverAt && (
        <p role="status">{t("copy.bes.k.i.annet.vassdrag.er.registrert.utstyret.ma.91f572d")}</p>
      )}
      {url ? (
        <a href={url} download={document.attachmentName}>
          {selectLocalized(language, "Last ned originalvedlegg", "Download original attachment")}:{" "}
          {document.attachmentName}
        </a>
      ) : (
        <p>{t("copy.ingen.kopi.vedlagt.ta.med.original.dokumentasjon.f0ae45e")}</p>
      )}
      {!isMock &&
        !document.derivedAccess &&
        document.verification?.method !== "permit-purchase" && (
          <button className="secondary" onClick={edit}>
            {t("copy.endre.opplysninger.f0acacc")}
          </button>
        )}
      {!isMock && !document.derivedAccess && confirm ? (
        <div>
          <p>{t("copy.slette.denne.lokale.kopien.originalen.hos.utsted.b1f3850")}</p>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              await remove?.();
              setBusy(false);
              setConfirm(false);
            }}
          >
            {t("copy.ja.slett.lokal.kopi.d513a8a")}
          </button>
          <button onClick={() => setConfirm(false)}>{t("copy.behold.e8381c0")}</button>
        </div>
      ) : !isMock && !document.derivedAccess ? (
        <button onClick={() => setConfirm(true)}>{t("copy.slett.lokal.kopi.a720013")}</button>
      ) : null}
    </article>
  );
}
