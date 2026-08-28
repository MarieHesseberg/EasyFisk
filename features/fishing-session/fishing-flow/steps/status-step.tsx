import { CheckRow } from "@/components/ui/check-row";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { FlowTitle } from "@/components/ui/flow-title";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { appContentRepository } from "@/data/repositories/app-content";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { getZoneSeasonLabel } from "@/domain/zones/zone-rules";
import type { ZoneId } from "@/domain/zones/zone";

export function StatusStep({
  cancel,
  demoStatus,
  next,
  resolveBlock,
  scenario,
  selectedZone,
}: {
  cancel: () => void;
  demoStatus: DemoStatus;
  next: () => void;
  resolveBlock: () => void;
  scenario: DemoScenario;
  selectedZone: ZoneId;
}) {
  const { temperature } = activeFishingRules;
  const { riverStatus } = appContentRepository.getContent();
  const zoneName = fishingContentRepository.findZone(selectedZone)?.name ?? `Sone ${selectedZone}`;
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
          title={`Fiskekort · ${zoneName}`}
          sub={
            demoStatus === "noPermit"
              ? "Ikke funnet"
              : demoStatus === "wrongZone"
                ? `Kortet gjelder ${riverStatus.alternatePermitZoneShortName}`
                : `Gyldig til kl. ${riverStatus.permitExpiry}`
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
              ? `${String(temperature.demoMeasuredCelsius).replace(".", ",")} °C · fisket er stanset`
              : demoStatus === "closed"
                ? "Aktivt stengningsvarsel"
                : `${riverStatus.temperatureCelsius} °C · elva er åpen`
          }
          state={["hotWater", "closed"].includes(demoStatus) ? "error" : "ok"}
        />
        <CheckRow title="Fiskesesong" sub={`${zoneName} · ${getZoneSeasonLabel(selectedZone)}`} />
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
