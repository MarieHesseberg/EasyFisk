import { RequirementStatusRow } from "@/components/ui/requirement-status-row";
import type { AppContent } from "@/data/contracts/app-content-repository";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { statusState } from "@/domain/fishing-rules/status-checks";
export function RequirementsOverview({
  demoStatus,
  scenario,
  riverStatus,
  remainingSalmon,
  seasonQuota,
  openControlCard,
}: {
  demoStatus: DemoStatus;
  scenario: DemoScenario;
  riverStatus: AppContent["riverStatus"];
  remainingSalmon: number;
  seasonQuota: number;
  openControlCard: () => void;
}) {
  const stateFor = (ids: DemoStatus[]) => statusState(demoStatus, ids, scenario.level);
  return (
    <section>
      <div className="section-head">
        <h3>Dokumentasjon og status</h3>
        <button onClick={openControlCard}>Vis kontrollkort</button>
      </div>
      <div className="check-grid">
        <RequirementStatusRow
          icon="ticket"
          title={
            demoStatus === "noPermit"
              ? "Fiskekort mangler"
              : demoStatus === "wrongZone"
                ? "Fiskekort · feil sone"
                : `Fiskekort · ${riverStatus.currentZoneShortName}`
          }
          sub={
            demoStatus === "noPermit"
              ? "Ikke registrert"
              : demoStatus === "wrongZone"
                ? `Kortet gjelder ${riverStatus.alternatePermitZoneShortName}`
                : `Døgnkort · gyldig til ${riverStatus.permitExpiry}`
          }
          state={stateFor(["noPermit", "wrongZone"])}
        />
        <RequirementStatusRow
          icon="shield"
          title="Desinfisering"
          sub={
            demoStatus === "expiredDisinfection"
              ? "Utløpt"
              : demoStatus === "otherRiver"
                ? "Nytt vassdrag registrert"
                : riverStatus.disinfectionSummary
          }
          state={stateFor(["expiredDisinfection", "otherRiver"])}
        />
        <RequirementStatusRow
          icon="book"
          title="Statlig fiskeravgift"
          sub={demoStatus === "noFee" ? "Ikke dokumentert" : "Betalt og dokumentert"}
          state={stateFor(["noFee"])}
        />
        <RequirementStatusRow
          icon="fish"
          title={
            demoStatus === "lateReport"
              ? "Fangstrapport mangler"
              : demoStatus === "dailyQuota"
                ? "Døgnkvote laks"
                : "Sesongkvote laks"
          }
          sub={
            demoStatus === "lateReport"
              ? "Tidligere rapport må fullføres"
              : demoStatus === "dailyQuota"
                ? "Døgnkvoten er nådd"
                : demoStatus === "seasonQuota"
                  ? "Sesongkvoten er nådd"
                  : `${remainingSalmon} av ${seasonQuota} avlivet gjenstår`
          }
          quota
          state={stateFor(["dailyQuota", "seasonQuota", "lateReport"])}
        />
      </div>
    </section>
  );
}
