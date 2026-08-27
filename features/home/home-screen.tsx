import { Header } from "@/components/ui/header";
import { Icon } from "@/components/ui/icon";
import { Status } from "@/components/ui/status-row";
import { demoStatuses } from "@/data/mock/fishing-data";
import type { DemoStatus } from "@/domain/models";
import { formatClock, formatDuration } from "@/lib/time";

export function Home({
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
  const scenario = demoStatuses.find((s) => s.id === demoStatus)!;
  const stateFor = (ids: DemoStatus[]) =>
    ids.includes(demoStatus) ? (scenario.level === "warning" ? "warning" : "error") : "ok";
  return (
    <div className="screen">
      <Header title="Din fiskeoversikt" />
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
            <h2>{active ? "Du fisker i sone 3" : scenario.title}</h2>
          </div>
        </div>
        {active ? (
          <>
            <div className="timer">{formatDuration(elapsed)}</div>
            <p>Startet {formatClock(startTime)} · Sone 3</p>
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
          <Status
            icon="ticket"
            title={
              demoStatus === "noPermit"
                ? "Fiskekort mangler"
                : demoStatus === "wrongZone"
                  ? "Fiskekort · feil sone"
                  : "Fiskekort · Sone 3"
            }
            sub={
              demoStatus === "noPermit"
                ? "Ikke registrert"
                : demoStatus === "wrongZone"
                  ? "Kortet gjelder Sone 2"
                  : "Døgnkort · gyldig til 17:59"
            }
            state={stateFor(["noPermit", "wrongZone"])}
          />
          <Status
            icon="shield"
            title="Desinfisering"
            sub={
              demoStatus === "expiredDisinfection"
                ? "Utløpt"
                : demoStatus === "otherRiver"
                  ? "Nytt vassdrag registrert"
                  : "Gyldig 20 dager · ingen andre vassdrag"
            }
            state={stateFor(["expiredDisinfection", "otherRiver"])}
          />
          <Status
            icon="book"
            title="Statlig fiskeravgift"
            sub={demoStatus === "noFee" ? "Ikke dokumentert" : "Betalt og dokumentert"}
            state={stateFor(["noFee"])}
          />
          <Status
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
                    : `${Math.max(0, 4 - salmonKilled)} av 5 avlivet gjenstår`
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
              ? "Vanntemperatur 21,4 °C"
              : demoStatus === "closed"
                ? "Sone 3 er stengt"
                : "Vannføring 18 m³/s"}
          </h3>
          <p>
            {demoStatus === "hotWater"
              ? "Alt fiske er midlertidig stanset"
              : demoStatus === "closed"
                ? "Aktivt stengningsvarsel · se åpne soner"
                : "Vanntemperatur 11 °C · stans ved over 21 °C"}
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
        <small>REGLER OPPDATERT 1. AUGUST 2026</small>
        <h3>Én laks per fiskerdøgn</h3>
        <p>
          Når én laks er avlivet, skal alt fiske stoppe til neste fiskerdøgn. Minstemålet er 35 cm.
          Én av sesongens fem avlivede laks kan være opptil 90 cm. De fire øvrige må være under 65
          cm.
        </p>
        <button onClick={onRules}>
          Se komplett regelkontroll <Icon name="chevron" size={16} />
        </button>
      </section>
    </div>
  );
}
