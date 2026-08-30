import { Icon } from "@/components/ui/icon";
import type { DemoScenario } from "@/domain/fishing-rules/rule";
import { formatClock, formatDuration } from "@/lib/time";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
export function HomeSessionCard({
  active,
  elapsed,
  startTime,
  scenario,
  documentReadiness,
  documentsLoading,
  documentsError,
  zone,
  openFlow,
}: {
  active: boolean;
  elapsed: number;
  startTime: number | null;
  scenario: DemoScenario;
  documentReadiness: DocumentReadiness;
  documentsLoading: boolean;
  documentsError: boolean;
  zone: string;
  openFlow: () => void;
}) {
  const documentsUnavailable = documentsLoading || documentsError;
  const documentsMissing = !documentsUnavailable && !documentReadiness.complete;
  const effectiveLevel =
    scenario.level !== "ok"
      ? scenario.level
      : documentsUnavailable || documentsMissing
        ? "blocked"
        : "warning";
  const title =
    scenario.level !== "ok"
      ? scenario.title
      : documentsLoading
        ? "Kontrollerer dokumentasjon"
        : documentsError
          ? "Dokumentstatus er utilgjengelig"
          : documentsMissing
            ? "Dokumentasjon mangler"
            : "Kontroller dokumentene";
  const detail =
    scenario.level !== "ok"
      ? scenario.detail
      : documentsLoading
        ? "Venter på den lokale dokumentmappen."
        : documentsError
          ? "Dokumentene kunne ikke leses. Du kan ikke starte før statusen er avklart."
          : documentsMissing
            ? `Registrer ${documentReadiness.missingLabels.join(", ")}.`
            : "Alle tre dokumenttypene er egenregistrert. Kontroller originalene før du starter.";
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
          <h2>{active ? `Du fisker i ${zone.toLowerCase()}` : title}</h2>
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
        <p>{detail}</p>
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
