import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { RequirementStatusRow } from "@/components/ui/requirement-status-row";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { appContentRepository } from "@/data/repositories/app-content";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import { findDemoStatus } from "@/domain/fishing-rules/find-demo-status";
import { statusState } from "@/domain/fishing-rules/status-checks";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { formatClock, formatDuration } from "@/lib/time";

export function HomeScreen({
  onStart,
  onRules,
  onFeedback,
  onControlCard,
  onCatchShortcut,
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
  onCatchShortcut: () => void;
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
  const stateFor = (ids: DemoStatus[]) => statusState(demoStatus, ids, scenario.level);
  return (
    <div className="screen">
      <ScreenHeader title="Din fiskeoversikt" />
      <section className={"status-card " + (active ? "active" : scenario.level)}>
        <div className="status-top">
          <span className="status-icon">
            <Icon
              name={active ? "clock" : scenario.level === "ok" ? "check" : "shield"}
              size={25}
            />
          </span>
          <div>
            <small>
              {active
                ? "FISKEØKT PÅGÅR"
                : scenario.level === "blocked"
                  ? "HANDLING KREVES"
                  : scenario.level === "warning"
                    ? "MÅ KONTROLLERES"
                    : "STATUS NÅ"}
            </small>
            <h2>
              {active
                ? `Du fisker i ${riverStatus.currentZoneShortName.toLowerCase()}`
                : scenario.title}
            </h2>
          </div>
        </div>
        {active ? (
          <>
            <div className="timer">{formatDuration(elapsed)}</div>
            <p>
              Startet {formatClock(startTime)} · {riverStatus.currentZoneShortName}
            </p>
          </>
        ) : (
          <p>{scenario.detail}</p>
        )}
        <button className={active ? "stop-button" : "start-button"} onClick={onStart}>
          <Icon name={active ? "clock" : "activity"} size={20} />
          {active
            ? "STOPP FISKE"
            : scenario.level === "blocked"
              ? "SE HVA SOM MANGLER"
              : scenario.level === "warning"
                ? "KONTROLLER OG START"
                : "START FISKE"}
        </button>
      </section>
      <section>
        <div className="section-head">
          <h3>Dokumentasjon og status</h3>
          <button onClick={onControlCard}>Vis kontrollkort</button>
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
                  : demoStatus === "seasonQuota"
                    ? "Sesongkvote laks"
                    : "Sesongkvote laks"
            }
            sub={
              demoStatus === "lateReport"
                ? "Tidligere rapport må fullføres"
                : demoStatus === "dailyQuota"
                  ? "Døgnkvoten er nådd"
                  : demoStatus === "seasonQuota"
                    ? "Sesongkvoten er nådd"
                    : `${Math.max(0, quota.killedSalmonPerSeason - 1 - salmonKilled)} av ${quota.killedSalmonPerSeason} avlivet gjenstår`
            }
            quota
            state={stateFor(["dailyQuota", "seasonQuota", "lateReport"])}
          />
        </div>
      </section>
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
      <section className={"notice " + (["hotWater", "closed"].includes(demoStatus) ? "error" : "")}>
        <div className="notice-icon">
          <Icon name="leaf" />
        </div>
        <div>
          <small>EKSEMPELDATA · KJØLEMO</small>
          <h3>
            {demoStatus === "hotWater"
              ? `Vanntemperatur ${String(temperature.demoMeasuredCelsius).replace(".", ",")} °C`
              : demoStatus === "closed"
                ? `${riverStatus.currentZoneShortName} er stengt`
                : `Vannføring ${riverStatus.flowCubicMetersPerSecond} m³/s`}
          </h3>
          <p>
            {demoStatus === "hotWater"
              ? "Alt fiske er midlertidig stanset"
              : demoStatus === "closed"
                ? "Aktivt stengningsvarsel · se åpne soner"
                : `Vanntemperatur ${riverStatus.temperatureCelsius} °C · stans ved over ${temperature.closureThresholdCelsius} °C`}
          </p>
        </div>
        <span className="trend">→</span>
      </section>
      <section>
        <div className="section-head">
          <h3>Snarveier</h3>
        </div>
        <div className="quick-grid">
          <button onClick={onCatchShortcut}>
            <Icon name="fish" />
            <span>Registrer fangst</span>
          </button>
          <button onClick={onMapShortcut}>
            <Icon name="map" />
            <span>Finn riktig sone</span>
          </button>
          <button onClick={onRules}>
            <Icon name="book" />
            <span>Regler for meg</span>
          </button>
        </div>
      </section>
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
