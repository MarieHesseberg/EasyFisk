import { FlowTitle } from "@/components/ui/flow-title";
import type { SessionRecord } from "@/domain/sessions/session";
import { formatClock, formatLongDuration } from "@/lib/time";

export function SessionSummaryStep({
  finish,
  session,
}: {
  finish: () => void;
  session: SessionRecord;
}) {
  return (
    <div className="flow-content">
      <FlowTitle
        icon="check"
        eyebrow="ØKTEN ER LAGRET"
        title="Takk for rapporteringen"
        text="Fiskeaktiviteten er lagret og lagt til i økthistorikken."
      />
      <div className="final-summary">
        <div>
          <small>SONE</small>
          <b>{session.zone}</b>
        </div>
        <div>
          <small>TIDSPUNKT</small>
          <b>
            {formatClock(session.start)}–{formatClock(session.end)}
          </b>
        </div>
        <div>
          <small>VARIGHET</small>
          <b>{formatLongDuration(session.duration)}</b>
        </div>
        <div>
          <small>FANGST</small>
          <b>{session.result}</b>
        </div>
        <div>
          <small>RAPPORTSTATUS</small>
          <b className="status-positive">Fullført og registrert</b>
        </div>
      </div>
      <button className="primary" onClick={finish}>
        Tilbake til oversikten
      </button>
    </div>
  );
}
