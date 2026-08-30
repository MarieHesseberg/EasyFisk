import { RequirementStatusRow } from "@/components/ui/requirement-status-row";
import { DocumentOverview } from "@/features/documents/document-overview";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import type { DetailDestination } from "@/domain/navigation/navigation";
import { statusState } from "@/domain/fishing-rules/status-checks";

export function RequirementsOverview({
  demoStatus,
  scenario,
  remainingSalmon,
  seasonQuota,
  openControlCard,
  openDocument,
}: {
  demoStatus: DemoStatus;
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
      <DocumentOverview open={openDocument} />
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
