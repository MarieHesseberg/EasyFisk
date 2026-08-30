import { RequirementStatusRow } from "@/components/ui/requirement-status-row";
import { DocumentOverview } from "@/features/documents/document-overview";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { statusState } from "@/domain/fishing-rules/status-checks";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { FishingStartQuotaStatus } from "@/domain/quotas/get-fishing-start-quota-status";

export function RequirementsOverview({
  demoStatus,
  documentReadiness,
  isStatusTestMode,
  scenario,
  remainingSalmon,
  seasonQuota,
  quotaStatus,
  openControlCard,
  openDocument,
  openPermitShop,
}: {
  demoStatus: DemoStatus;
  documentReadiness: DocumentReadiness;
  isStatusTestMode: boolean;
  scenario: DemoScenario;
  remainingSalmon: number;
  seasonQuota: number;
  quotaStatus: FishingStartQuotaStatus;
  openControlCard: () => void;
  openDocument: (destination: DetailDestination) => void;
  openPermitShop: () => void;
}) {
  return (
    <section>
      <div className="section-head">
        <h3>Dokumentasjon og status</h3>
        <button onClick={openControlCard}>Mine dokumenter</button>
      </div>
      <DocumentOverview
        open={openDocument}
        testReadiness={isStatusTestMode ? documentReadiness : undefined}
      />
      {!documentReadiness.valid.permit && (
        <button className="primary home-buy-permit" onClick={openPermitShop}>
          Kjøp fiskekort
        </button>
      )}
      <div className="check-grid">
        <RequirementStatusRow
          icon="fish"
          title="Sesongkvote laks"
          sub={
            demoStatus === "dailyQuota"
              ? `Døgnkvote nådd · ${quotaStatus.killedToday} avlivet · ${quotaStatus.releasedToday} gjenutsatt`
              : demoStatus === "seasonQuota"
                ? `Sesongkvote nådd · ${quotaStatus.killedThisSeason} avlivet · ${quotaStatus.releasedThisSeason} gjenutsatt`
                : `${remainingSalmon} av ${seasonQuota} avlivet gjenstår`
          }
          quota
          state={statusState(
            demoStatus,
            ["dailyQuota", "seasonQuota", "lateReport"],
            scenario.level,
          )}
        />
      </div>
    </section>
  );
}
