import { Icon } from "@/components/ui/icon";
import { formatClock, formatDuration } from "@/lib/time";
export function ActiveSessionCard({
  activeZone,
  elapsed,
  startTime,
  registerCatch,
  showRules,
  stop,
}: {
  activeZone: string;
  elapsed: number;
  startTime: number | null;
  registerCatch: () => void;
  showRules: () => void;
  stop: () => void;
}) {
  return (
    <section className="active-session">
      <span className="pulse" />
      <small>AKTIV FISKEØKT</small>
      <h2>{activeZone}</h2>
      <div className="big-time">{formatDuration(elapsed)}</div>
      <p>Startet i dag kl. {formatClock(startTime)} · GPS-sone bekreftet</p>
      <div className="session-actions">
        <button onClick={registerCatch}>
          <Icon name="fish" />
          Registrer fangst
        </button>
        <button onClick={showRules}>
          <Icon name="map" />
          Sone og regler
        </button>
      </div>
      <button className="outline-danger" onClick={stop}>
        Stopp · bekreft fangst eller nullfangst
      </button>
    </section>
  );
}
