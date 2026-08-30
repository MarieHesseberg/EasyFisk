"use client";

import { CheckRow } from "@/components/ui/check-row";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { FlowTitle } from "@/components/ui/flow-title";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { appContentRepository } from "@/data/repositories/app-content";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { getZoneSeasonLabel } from "@/domain/zones/zone-rules";
import type { ZoneId } from "@/domain/zones/zone";
import { getStatusEngineDocumentReadiness } from "@/domain/fishing-rules/get-status-engine-document-readiness";

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
  const documentReadiness = getStatusEngineDocumentReadiness(demoStatus);
  const documentsBlocked = !documentReadiness.complete;
  const blocked = scenario.level === "blocked" || documentsBlocked;
  const title =
    scenario.level === "blocked"
      ? scenario.title
      : documentsBlocked
        ? "Dokumentasjon mangler"
        : scenario.title;
  const text =
    scenario.level === "blocked"
      ? scenario.detail
      : documentsBlocked
        ? `Statusmotoren har satt ${documentReadiness.missingLabels.join(", ")} som manglende.`
        : `${scenario.detail} Egenregistrerte dokumenter må fortsatt kunne fremvises i original.`;
  const effectiveLevel = blocked ? "blocked" : scenario.level === "ok" ? "warning" : scenario.level;

  return (
    <>
      <FlowTitle icon="shield" eyebrow="SIMULERT STATUSKONTROLL" title={title} text={text} />
      <div className={"scenario-banner " + effectiveLevel}>
        <b>
          {blocked
            ? "Kan ikke starte"
            : effectiveLevel === "warning"
              ? "Krever bekreftelse"
              : "Alle kontroller er godkjent"}
        </b>
        <span>
          {documentsBlocked
            ? "Lokale dokumentkrav er ikke oppfylt"
            : "Dokumenter registrert · originalene er ikke eksternt verifisert"}
        </span>
      </div>
      <div className="flow-checks">
        <CheckRow
          title={`Fiskekort · ${zoneName}`}
          sub={
            documentReadiness.valid.permit
              ? "Gyldig tidsrom · egenregistrert, ikke verifisert"
              : "Mangler eller er utløpt"
          }
          state={
            documentReadiness.valid.permit && !["noPermit", "wrongZone"].includes(demoStatus)
              ? "ok"
              : "error"
          }
        />
        <CheckRow
          title="Statlig fiskeravgift"
          sub={
            documentReadiness.valid.fee
              ? "Gjeldende år · egenregistrert, ikke verifisert"
              : "Mangler for gjeldende år"
          }
          state={documentReadiness.valid.fee && demoStatus !== "noFee" ? "ok" : "error"}
        />
        <CheckRow
          title="Desinfisering"
          sub={
            documentReadiness.valid.disinfection
              ? "Innen 20 dager · intet senere vassdrag registrert"
              : "Mangler, er utløpt eller annet vassdrag er besøkt"
          }
          state={
            documentReadiness.valid.disinfection &&
            !["expiredDisinfection", "otherRiver"].includes(demoStatus)
              ? "ok"
              : "error"
          }
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
                : `Eksempeldata: ${riverStatus.temperatureCelsius} °C · kontroller dagsstatus`
          }
          state={["hotWater", "closed"].includes(demoStatus) ? "error" : "ok"}
        />
        <CheckRow title="Fiskesesong" sub={`${zoneName} · ${getZoneSeasonLabel(selectedZone)}`} />
      </div>
      {blocked ? (
        <>
          <button
            className="primary blocked-action"
            onClick={scenario.level === "blocked" ? resolveBlock : cancel}
          >
            {scenario.action ?? "Lukk og registrer dokumentasjon"}
          </button>
          <button className="secondary" onClick={cancel}>
            Avbryt oppstart
          </button>
        </>
      ) : (
        <button className="primary" onClick={next}>
          Jeg har kontrollert originalene · fortsett
        </button>
      )}
    </>
  );
}
