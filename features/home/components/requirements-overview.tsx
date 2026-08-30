import { RequirementStatusRow } from "@/components/ui/requirement-status-row";
import { DocumentOverview } from "@/features/documents/document-overview";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { statusState } from "@/domain/fishing-rules/status-checks";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";

export function RequirementsOverview({
  demoStatus,
  documentReadiness,
  isStatusTestMode,
  scenario,
  remainingSalmon,
  seasonQuota,
  openControlCard,
  openDocument,
}: {
  demoStatus: DemoStatus;
  documentReadiness: DocumentReadiness;
  isStatusTestMode: boolean;
  scenario: DemoScenario;
  remainingSalmon: number;
  seasonQuota: number;
  openControlCard: () => void;
  openDocument: (destination: DetailDestination) => void;
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
      <div className="check-grid">
        <RequirementStatusRow
          icon="fish"
          title="Sesongkvote laks"
          sub={`${remainingSalmon} av ${seasonQuota} avlivet gjenstår`}
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
