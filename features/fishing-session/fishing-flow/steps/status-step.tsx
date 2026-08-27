import { CheckRow } from "@/components/ui/check-row";
import { FlowTitle } from "@/components/ui/flow-title";
import type { DemoScenario, DemoStatus } from "@/domain/models";

export function StatusStep({
  cancel,
  demoStatus,
  next,
  resolveBlock,
  scenario,
}: {
  cancel: () => void;
  demoStatus: DemoStatus;
  next: () => void;
  resolveBlock: () => void;
  scenario: DemoScenario;
}) {
  const blocked = scenario.level === "blocked";

  return (
    <>
      <FlowTitle
        icon="shield"
        eyebrow="STATUSKONTROLL"
        title={scenario.title}
        text={scenario.detail}
      />
      <div className={"scenario-banner " + scenario.level}>
        <b>
          {blocked
            ? "Kan ikke starte"
            : scenario.level === "warning"
              ? "Krever bekreftelse"
              : "Alle kontroller er godkjent"}
        </b>
        <span>{scenario.label}</span>
      </div>
      <div className="flow-checks">
        <CheckRow
          title="Fiskekort · Sone 3"
          sub={
            demoStatus === "noPermit"
              ? "Ikke funnet"
              : demoStatus === "wrongZone"
                ? "Kortet gjelder Sone 2"
                : "Gyldig til kl. 17:59"
          }
          state={["noPermit", "wrongZone"].includes(demoStatus) ? "error" : "ok"}
        />
        <CheckRow
          title="Statlig fiskeravgift"
          sub={demoStatus === "noFee" ? "Ikke dokumentert" : "Betalt og dokumentert"}
          state={demoStatus === "noFee" ? "error" : "ok"}
        />
        <CheckRow
          title="Desinfisering"
          sub={
            demoStatus === "expiredDisinfection"
              ? "Utløpt"
              : demoStatus === "otherRiver"
                ? "Nytt vassdrag registrert"
                : "Gyldig · ikke besøkt annet vassdrag"
          }
          state={["expiredDisinfection", "otherRiver"].includes(demoStatus) ? "error" : "ok"}
        />
        <CheckRow
          title="Kvoter og rapportering"
          sub={
            demoStatus === "dailyQuota"
              ? "Døgnkvote nådd"
              : demoStatus === "seasonQuota"
                ? "Sesongkvote nådd"
                : demoStatus === "lateReport"
                  ? "Forsinket fangstrapport"
                  : "Kvoter tilgjengelig · rapporter ajour"
          }
          state={
            demoStatus === "seasonQuota"
              ? "warning"
              : ["dailyQuota", "lateReport"].includes(demoStatus)
                ? "error"
                : "ok"
          }
        />
        <CheckRow
          title="Temperatur og stengning"
          sub={
            demoStatus === "hotWater"
              ? "21,4 °C · fisket er stanset"
              : demoStatus === "closed"
                ? "Aktivt stengningsvarsel"
                : "11 °C · elva er åpen"
          }
          state={["hotWater", "closed"].includes(demoStatus) ? "error" : "ok"}
        />
        <CheckRow title="Fiskesesong" sub="Sone 3 · 1. juni–31. august" />
      </div>
      {blocked ? (
        <>
          <button className="primary blocked-action" onClick={resolveBlock}>
            {scenario.action}
          </button>
          <button className="secondary" onClick={cancel}>
            Avbryt oppstart
          </button>
        </>
      ) : (
        <button className="primary" onClick={next}>
          {scenario.level === "warning" ? "Jeg forstår · fortsett" : "Fortsett til posisjon"}
        </button>
      )}
    </>
  );
}
