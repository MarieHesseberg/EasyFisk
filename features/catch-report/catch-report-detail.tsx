"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/models";
import { formatClock } from "@/lib/time";

export function CatchReportDetail({
  report,
  onClose,
  onCorrect,
}: {
  report: CatchRecord;
  onClose: () => void;
  onCorrect: (note: string) => void;
}) {
  const [note, setNote] = useState(report.correction || ""),
    [editing, setEditing] = useState(false);
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="catch-modal report-detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <small>INNSENDT FANGSTRAPPORT</small>
        <h2>
          {report.species} · {report.result.toLowerCase()}
        </h2>
        <div className={"report-status-banner " + (report.late ? "late" : "ok")}>
          <Icon name={report.late ? "clock" : "check"} />
          <div>
            <b>{report.late ? "Rapportert etter fristen" : "Rapportert innen fristen"}</b>
            <span>
              Fangst {formatClock(report.caughtAt)} · sendt {formatClock(report.submittedAt)}
            </span>
          </div>
        </div>
        {report.imageData && (
          // Bildet er lokalt valgt av brukeren og finnes som en data-URL, ikke som en optimaliserbar fil.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="catch-report-image"
            src={report.imageData}
            alt="Vedlagt bilde av fangsten"
          />
        )}
        <div className="past-review">
          <p>
            <small>RAPPORT-ID</small>
            <b>{report.id}</b>
          </p>
          <p>
            <small>ØKT OG SONE</small>
            <b>
              {report.zone} · startet {formatClock(report.sessionStart)}
            </b>
          </p>
          <p>
            <small>STØRRELSE</small>
            <b>
              {report.length} cm · {report.weight} kg
            </b>
          </p>
          <p>
            <small>RESULTAT</small>
            <b>{report.result}</b>
          </p>
          <p>
            <small>BILDE</small>
            <b>{report.imageName || "Ikke vedlagt"}</b>
          </p>
          {report.comment && (
            <p>
              <small>KOMMENTAR</small>
              <b>{report.comment}</b>
            </p>
          )}
        </div>
        {report.violation && (
          <div className="violation-sent">
            <b>Rapportert regelavvik</b>
            <p>
              Fangsten er lagret slik den faktisk ble oppgitt, med tydelig merking for mulig
              oppfølging.
            </p>
          </div>
        )}
        {report.correction && !editing && (
          <div className="correction-sent">
            <b>Rettelse er meldt</b>
            <p>{report.correction}</p>
          </div>
        )}
        {editing ? (
          <>
            <label className="correction-field">
              Hva er feil i rapporten?
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Beskriv hva som skal korrigeres"
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
              Send rettelsesmelding
            </button>
            <button className="secondary" onClick={() => setEditing(false)}>
              Avbryt
            </button>
          </>
        ) : (
          <button className="secondary" onClick={() => setEditing(true)}>
            {report.correction ? "Oppdater rettelsesmelding" : "Meld feil i rapporten"}
          </button>
        )}
      </div>
    </div>
  );
}
