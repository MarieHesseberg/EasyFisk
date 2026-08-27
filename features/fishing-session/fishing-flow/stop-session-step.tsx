import { FlowTitle } from "@/components/ui/flow-title";
import { formatClock, formatLongDuration } from "@/lib/time";

export function StopSessionStep({
  cancel,
  elapsed,
  finish,
  startTime,
}: {
  cancel: () => void;
  elapsed: number;
  finish: (caught: boolean) => void;
  startTime: number | null;
}) {
  return (
    <div className="flow-content">
      <FlowTitle
        icon="clock"
        eyebrow="AVSLUTT FISKEØKT"
        title="Fikk du fangst?"
        text="Alle økter lagres, også når du ikke fikk fisk. Dette gir bedre kunnskap om fiskeinnsatsen."
      />
      <div className="stop-summary">
        <span>
          <small>SONE</small>
          <b>Sone 3</b>
        </span>
        <span>
          <small>START</small>
          <b>{formatClock(startTime)}</b>
        </span>
        <span>
          <small>VARIGHET</small>
          <b>{formatLongDuration(elapsed)}</b>
        </span>
      </div>
      <button className="primary" onClick={() => finish(false)}>
        Nei · registrer nullfangst
      </button>
      <button className="secondary" onClick={() => finish(true)}>
        Ja · registrer manglende fangst
      </button>
      <button className="text-button" onClick={cancel}>
        Fortsett å fiske
      </button>
    </div>
  );
}
