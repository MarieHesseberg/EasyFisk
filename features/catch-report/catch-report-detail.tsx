"use client";
import { AppDialogPortal } from "@/components/ui/app-dialog-portal";
import { selectLocalized } from "@/locales";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/catches/catch";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";
import { formatClock } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function CatchReportDetail({
  report,
  onClose,
  onCorrect,
}: {
  report: CatchRecord;
  onClose: () => void;
  onCorrect: (note: string) => void;
}) {
  const { language, t } = useLanguage();
  const [note, setNote] = useState(report.correction || ""),
    [editing, setEditing] = useState(false);
  const dialogRef = useDialogAccessibility(onClose);
  return (
    <AppDialogPortal>
      <div className="modal-bg" onClick={onClose}>
        <div
          ref={dialogRef}
          className="catch-modal report-detail-modal"
          role="dialog"
          aria-modal="false"
          aria-labelledby="catch-report-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="modal-close"
            aria-label={t("copy.lukk.fangstrapport.ad00025")}
            onClick={onClose}
          >
            ×
          </button>
          <small>{t("copy.innsendt.fangstrapport.bc44267")}</small>
          <h2 id="catch-report-title">
            {t(report.species)} · {t(report.result).toLowerCase()}
          </h2>
          <div className={"report-status-banner " + (report.late ? "late" : "ok")}>
            <Icon name={report.late ? "clock" : "check"} />
            <div>
              <b>{t(report.late ? "prototype.catchLate" : "prototype.catchOnTime")}</b>
              <span>
                {selectLocalized(
                  language,
                  `Fangst ${formatClock(report.caughtAt, language)} · lagret lokalt ${formatClock(report.submittedAt, language)}`,
                  `Caught ${formatClock(report.caughtAt, language)} · saved locally ${formatClock(report.submittedAt, language)}`,
                )}
              </span>
            </div>
          </div>
          <p>{t("prototype.localOnly")}</p>
          {report.imageData && (
            // Bildet er lokalt valgt av brukeren og finnes som en data-URL, ikke som en optimaliserbar fil.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="catch-report-image"
              src={report.imageData}
              alt={t("copy.vedlagt.bilde.av.fangsten.b5be069")}
            />
          )}
          <div className="past-review">
            <p>
              <small>{t("copy.rapport.id.4b4e7b0")}</small>
              <b>{report.id}</b>
            </p>
            <p>
              <small>{t("copy.kt.og.sone.40245a4")}</small>
              <b>
                {report.zone} · {t("copy.startet.3ff57f6")}{" "}
                {formatClock(report.sessionStart, language)}
              </b>
            </p>
            <p>
              <small>{t("copy.st.rrelse.494ba4c")}</small>
              <b>
                {report.length} cm · {report.weight} kg
              </b>
            </p>
            <p>
              <small>{t("copy.resultat.a68cd1b")}</small>
              <b>{t(report.result)}</b>
            </p>
            <p>
              <small>{t("copy.bilde.5d25e1d")}</small>
              <b>{report.imageName || t("copy.ikke.vedlagt.037f563")}</b>
            </p>
            {report.comment && (
              <p>
                <small>{t("copy.kommentar.7c71758")}</small>
                <b>{report.comment}</b>
              </p>
            )}
          </div>
          {report.violation && (
            <div className="violation-sent">
              <b>{t("copy.rapportert.regelavvik.b49e1c8")}</b>
              <p>{t("catch.savedAsReported")}</p>
            </div>
          )}
          {report.correction && !editing && (
            <div className="correction-sent">
              <b>{t("copy.rettelse.er.meldt.feec083")}</b>
              <p>{report.correction}</p>
            </div>
          )}
          {editing ? (
            <>
              <label className="correction-field">
                {t("copy.hva.er.feil.i.rapporten.96c6ca7")}
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("copy.beskriv.hva.som.skal.korrigeres.88504bb")}
                />
              </label>
              <button
                className="primary"
                disabled={note.trim().length < 5}
                onClick={() => {
                  onCorrect(note.trim());
                  setEditing(false);
                }}
              >
                {t("copy.send.rettelsesmelding.48949f1")}
              </button>
              <button className="secondary" onClick={() => setEditing(false)}>
                {t("copy.avbryt.d10c9f7")}
              </button>
            </>
          ) : (
            <button className="secondary" onClick={() => setEditing(true)}>
              {t(report.correction ? "Oppdater rettelsesmelding" : "Meld feil i rapporten")}
            </button>
          )}
        </div>
      </div>
    </AppDialogPortal>
  );
}
