import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";
import { formatClock, formatLongDuration } from "@/lib/time";

const norwegianDate = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function SessionHistoryDetail({
  catches,
  onClose,
  session,
}: {
  catches: CatchRecord[];
  onClose: () => void;
  session: SessionRecord;
}) {
  const dialogRef = useDialogAccessibility(onClose);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div
        ref={dialogRef}
        className="catch-modal session-history-detail"
        role="dialog"
        aria-modal="true"
        aria-label="Detaljer for fiskeøkt"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" aria-label="Lukk øktdetaljer" onClick={onClose}>
          ×
        </button>
        <small>FISKEØKT</small>
        <h2>{norwegianDate.format(new Date(session.end))}</h2>

        <div className="detail-data">
          <p>
            <span>Sone</span>
            <b>{session.zone}</b>
          </p>
          <p>
            <span>Tidspunkt</span>
            <b>
              {formatClock(session.start)}–{formatClock(session.end)}
            </b>
          </p>
          <p>
            <span>Varighet</span>
            <b>{formatLongDuration(session.duration)}</b>
          </p>
          <p>
            <span>Resultat</span>
            <b>{session.result}</b>
          </p>
        </div>

        <h3>Fangster i økten</h3>
        {catches.length === 0 ? (
          <div className="session-catch-empty">
            <Icon name="fish" size={20} /> Ingen fangster registrert
          </div>
        ) : (
          <div className="session-catch-list">
            {catches.map((record) => (
              <p key={record.id}>
                <b>{record.species}</b>
                <span>
                  {record.result} · {record.length} cm · {String(record.weight).replace(".", ",")}{" "}
                  kg
                </span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
