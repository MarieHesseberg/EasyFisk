import { Icon } from "@/components/ui/icon";
import type { DemoScenario } from "@/domain/fishing-rules/rule";
import { formatClock, formatDuration } from "@/lib/time";
export function HomeSessionCard({
  active,
  elapsed,
  startTime,
  scenario,
  isTestMode,
  zone,
  openFlow,
}: {
  active: boolean;
  elapsed: number;
  startTime: number | null;
  scenario: DemoScenario;
  isTestMode: boolean;
  zone: string;
  openFlow: () => void;
}) {
  const effectiveLevel = scenario.level;
  return (
    <section className={`status-card ${active ? "active" : effectiveLevel}`}>
      <div className="status-top">
        <span className="status-icon">
          <Icon
            name={active ? "clock" : effectiveLevel === "warning" ? "check" : "shield"}
            size={25}
          />
        </span>
        <div>
          <small>
            {active
              ? "FISKEØKT PÅGÅR"
              : effectiveLevel === "blocked"
                ? "HANDLING KREVES"
                : effectiveLevel === "warning"
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
        <p>{isTestMode ? `Testsituasjon: ${scenario.detail}` : scenario.detail}</p>
      )}
      <button className={active ? "stop-button" : "start-button"} onClick={openFlow}>
        <Icon name={active ? "clock" : "activity"} size={20} />
        {active
          ? "STOPP FISKE"
          : effectiveLevel === "blocked"
            ? "SE HVA SOM MANGLER"
            : effectiveLevel === "warning"
              ? "KONTROLLER OG START"
              : "START FISKE"}
      </button>
    </section>
  );
}
