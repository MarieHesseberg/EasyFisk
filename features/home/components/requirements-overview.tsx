import { RequirementStatusRow } from "@/components/ui/requirement-status-row";
import { DocumentOverview } from "@/features/documents/document-overview";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { statusState } from "@/domain/fishing-rules/status-checks";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { FishingStartQuotaStatus } from "@/domain/quotas/get-fishing-start-quota-status";
import { useLanguage } from "@/components/localization/language-provider";

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
  const { t } = useLanguage();
  return (
    <section>
      <div className="section-head">
        <h3>{t("copy.dokumentasjon.og.status.0fd030e")}</h3>
        <button onClick={openControlCard}>{t("copy.mine.dokumenter.39d5623")}</button>
      </div>
      <DocumentOverview
        open={openDocument}
        testReadiness={isStatusTestMode ? documentReadiness : undefined}
      />
      {!documentReadiness.valid.permit && (
        <button className="primary home-buy-permit" onClick={openPermitShop}>
          {t("copy.kj.p.fiskekort.d32ea04")}
        </button>
      )}
      <div className="check-grid">
        <RequirementStatusRow
          icon="fish"
          title={t("copy.sesongkvote.laks.4d55979")}
          sub={
            demoStatus === "dailyQuota"
              ? t("home.dailyQuota", {
                  killed: quotaStatus.killedToday,
                  released: quotaStatus.releasedToday,
                })
              : demoStatus === "seasonQuota"
                ? t("home.seasonQuota", {
                    killed: quotaStatus.killedThisSeason,
                    released: quotaStatus.releasedThisSeason,
                  })
                : t("home.quotaRemaining", { remaining: remainingSalmon, total: seasonQuota })
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
