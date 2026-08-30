import { Icon } from "@/components/ui/icon";
import type { DemoScenario } from "@/domain/fishing-rules/rule";
import { formatClock, formatDuration } from "@/lib/time";
export function HomeSessionCard({
  active,
  elapsed,
  startTime,
  scenario,
  zone,
  openFlow,
}: {
  active: boolean;
  elapsed: number;
  startTime: number | null;
  scenario: DemoScenario;
  zone: string;
  openFlow: () => void;
}) {
  return (
    <section className={`status-card ${active ? "active" : scenario.level}`}>
      <div className="status-top">
        <span className="status-icon">
          <Icon name={active ? "clock" : scenario.level === "ok" ? "check" : "shield"} size={25} />
        </span>
        <div>
          <small>
            {active
              ? "FISKEØKT PÅGÅR"
              : scenario.level === "blocked"
                ? "HANDLING KREVES"
                : scenario.level === "warning"
                  ? "MÅ KONTROLLERES"
                  : "STATUS NÅ"}
          </small>
          <h2>{active ? `Du fisker i ${zone.toLowerCase()}` : scenario.title}</h2>
        </div>
      </div>
      {active ? (
        <>
          <div className="timer">{formatDuration(elapsed)}</div>
          <p>
            Startet {formatClock(startTime)} · {zone}
          </p>
        </>
      ) : (
        <p>Demostatus: {scenario.detail} Dokumenter må kontrolleres separat.</p>
      )}
      <button className={active ? "stop-button" : "start-button"} onClick={openFlow}>
        <Icon name={active ? "clock" : "activity"} size={20} />
        {active
          ? "STOPP FISKE"
          : scenario.level === "blocked"
            ? "SE HVA SOM MANGLER"
            : scenario.level === "warning"
              ? "KONTROLLER OG START"
              : "START FISKE"}
      </button>
    </section>
  );
}
