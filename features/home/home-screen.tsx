import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { HomeSessionCard } from "@/features/home/components/home-session-card";
import { RequirementsOverview } from "@/features/home/components/requirements-overview";
import { HomeShortcuts } from "@/features/home/components/home-shortcuts";
import { appContentRepository } from "@/data/repositories/app-content";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import type { DetailDestination } from "@/domain/navigation/navigation";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { FishingStartQuotaStatus } from "@/domain/quotas/get-fishing-start-quota-status";

export function HomeScreen({
  onStart,
  onRules,
  onFeedback,
  onControlCard,
  onDocument,
  onPastSession,
  onMapShortcut,
  active,
  elapsed,
  startTime,
  demoStatus,
  scenario,
  documentReadiness,
  isStatusTestMode,
  salmonKilled,
  quotaStatus,
}: {
  onStart: () => void;
  onRules: () => void;
  onFeedback: () => void;
  onControlCard: () => void;
  onDocument: (destination: DetailDestination) => void;
  onPastSession: () => void;
  onMapShortcut: () => void;
  active: boolean;
  elapsed: number;
  startTime: number | null;
  demoStatus: DemoStatus;
  scenario: DemoScenario;
  documentReadiness: DocumentReadiness;
  isStatusTestMode: boolean;
  salmonKilled: number;
  quotaStatus: FishingStartQuotaStatus;
}) {
  const { riverStatus } = appContentRepository.getContent();
  const { catchSize, metadata, quota } = activeFishingRules;
  return (
    <div className="screen">
      <ScreenHeader title="Din fiskeoversikt" />
      <HomeSessionCard
        active={active}
        elapsed={elapsed}
        startTime={startTime}
        scenario={scenario}
        isTestMode={isStatusTestMode}
        zone={riverStatus.currentZoneShortName}
        openFlow={onStart}
      />
      <button className="home-past-session-button" onClick={onPastSession}>
        <Icon name="clock" size={20} />
        <span>
          <b>Registrer tidligere fisketur</b>
          <small>Etterregistrer en tur uten å starte en ny fiskeøkt</small>
        </span>
        <Icon name="chevron" size={18} />
      </button>
      <RequirementsOverview
        demoStatus={demoStatus}
        documentReadiness={documentReadiness}
        isStatusTestMode={isStatusTestMode}
        scenario={scenario}
        openDocument={onDocument}
        remainingSalmon={Math.max(0, quota.killedSalmonPerSeason - salmonKilled)}
        seasonQuota={quota.killedSalmonPerSeason}
        quotaStatus={quotaStatus}
        openControlCard={onControlCard}
      />
      <button className="home-feedback-card" onClick={onFeedback}>
        <span>
          <Icon name="bell" />
        </span>
        <div>
          <small>TILBAKEMELDING OG OBSERVASJON</small>
          <b>Meld fra til elveeigarlaget</b>
          <p>Rapporter feil, forsøpling, syk fisk eller mistenkelig fiske.</p>
        </div>
        <Icon name="chevron" size={18} />
      </button>
      <HomeShortcuts openMap={onMapShortcut} openRules={onRules} />
      <section className="info-card">
        <small>REGLER OPPDATERT {metadata.versionLabel.toUpperCase()}</small>
        <h3>{quota.killedSalmonPerDay} laks per fiskerdøgn</h3>
        <p>
          Når én laks er avlivet, skal alt fiske stoppe til neste fiskerdøgn. Minstemålet er{" "}
          {catchSize.minimumCm} cm. Én av sesongens {quota.killedSalmonPerSeason} avlivede laks kan
          være opptil {catchSize.largeSalmonMaximumCm} cm. De øvrige må være under{" "}
          {catchSize.regularSalmonMaximumCm} cm.
        </p>
        <button onClick={onRules}>
          Se komplett regelkontroll <Icon name="chevron" size={16} />
        </button>
      </section>
    </div>
  );
}
