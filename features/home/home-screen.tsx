import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { HomeSessionCard } from "@/features/home/components/home-session-card";
import { RequirementsOverview } from "@/features/home/components/requirements-overview";
import { HomeShortcuts } from "@/features/home/components/home-shortcuts";
import { RiverEnvironmentCard } from "@/features/home/components/river-environment-card";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { appContentRepository } from "@/data/repositories/app-content";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import { findDemoStatus } from "@/domain/fishing-rules/find-demo-status";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";

export function HomeScreen({
  onStart,
  onRules,
  onFeedback,
  onControlCard,
  onPastSession,
  onMapShortcut,
  active,
  elapsed,
  startTime,
  demoStatus,
  salmonKilled,
}: {
  onStart: () => void;
  onRules: () => void;
  onFeedback: () => void;
  onControlCard: () => void;
  onPastSession: () => void;
  onMapShortcut: () => void;
  active: boolean;
  elapsed: number;
  startTime: number | null;
  demoStatus: DemoStatus;
  salmonKilled: number;
}) {
  const { riverStatus } = appContentRepository.getContent();
  const scenario = findDemoStatus(demoStatus, fishingContentRepository.getDemoScenarios());
  const { catchSize, metadata, quota, temperature } = activeFishingRules;
  return (
    <div className="screen">
      <ScreenHeader title="Din fiskeoversikt" />
      <HomeSessionCard
        active={active}
        elapsed={elapsed}
        startTime={startTime}
        scenario={scenario}
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
        scenario={scenario}
        riverStatus={riverStatus}
        remainingSalmon={Math.max(0, quota.killedSalmonPerSeason - salmonKilled)}
        seasonQuota={quota.killedSalmonPerSeason}
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
      <RiverEnvironmentCard
        demoStatus={demoStatus}
        station={riverStatus.measurementStation}
        temperature={riverStatus.temperatureCelsius}
        measuredHotTemperature={temperature.demoMeasuredCelsius}
        closureTemperature={temperature.closureThresholdCelsius}
        flow={riverStatus.flowCubicMetersPerSecond}
        zone={riverStatus.currentZoneShortName}
      />
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
