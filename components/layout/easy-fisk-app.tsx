"use client";

import { useEasyFiskController } from "@/application/easy-fisk/use-easy-fisk-controller";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { findDemoStatus } from "@/domain/fishing-rules/find-demo-status";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { countKilledSalmon } from "@/domain/quotas/count-killed-salmon";
import { findZoneName } from "@/domain/zones/find-zone-name";
import { FishingFlow } from "@/features/fishing-session/fishing-flow";
import { Home } from "@/features/home/home-screen";
import { MapScreen } from "@/features/map/map-screen";
import { Detail } from "@/features/profile/detail";
import { More } from "@/features/profile/more-screen";
import { RulesScreen } from "@/features/rules/rules-screen";
import { Stats } from "@/features/statistics/statistics-screen";

export function EasyFiskApp() {
  const { state, actions } = useEasyFiskController();
  const {
    active,
    catches,
    demoStatus,
    elapsed,
    finishAfterCatch,
    flow,
    globalDetail,
    lastSession,
    requestedCatchTime,
    screen,
    sessionZone,
    startTime,
    statsMineRequested,
    toast,
    zone,
  } = state;
  const nav = [
    ["home", "Hjem", "home"],
    ["map", "Kart", "map"],
    ["rules", "Regler", "book"],
    ["stats", "Statistikk", "stats"],
    ["more", "Mer", "more"],
  ] as const;
  const features = [
    "Samlet kontroll av fiskekort, avgift, desinfisering og kvote",
    "Start/stopp av fiskeøkt med GPS-forslag til sone",
    "Fangstrapport i tre steg med automatisk tid og sone",
    "Nullfangst, fiskehistorikk og personlig kvoteregnskap",
    "Veiledende kart over de fire faktiske hovedsonene",
    "Regler tilpasset sesong, sone og fangst",
    "Varsler om temperatur, stengninger og rapporteringsfrist",
    "Eksempel på aggregert fangst- og innsatsstatistikk",
    "Kontrollkort for oppsyn, favorittsoner og tilbakemeldinger",
  ];
  const demoStatuses = fishingContentRepository.getDemoScenarios();
  const zones = fishingContentRepository.getZones();
  const selectedDemo = findDemoStatus(demoStatus, demoStatuses);
  return (
    <main className="prototype-shell">
      <div className="phone-app">
        {screen === "home" && (
          <Home
            onStart={actions.openSessionFlow}
            onRules={() => actions.navigate("rules")}
            onFeedback={() => actions.openDetail("Tilbakemelding")}
            onControlCard={() => actions.openDetail("Kontrollkort")}
            onCatchShortcut={actions.openCatchHistory}
            onMapShortcut={() => actions.navigate("map")}
            active={active}
            elapsed={elapsed}
            startTime={startTime}
            demoStatus={demoStatus}
            salmonKilled={countKilledSalmon(catches)}
          />
        )}{" "}
        {screen === "map" && (
          <MapScreen selected={zone} setSelected={actions.setZone} onUseZone={actions.useZone} />
        )}{" "}
        {screen === "rules" && (
          <RulesScreen
            demoStatus={demoStatus}
            onRegisterPermit={() => actions.openDetail("Mine fiskekort")}
          />
        )}{" "}
        {screen === "stats" && (
          <Stats
            active={active}
            onStart={() => actions.setFlow("start")}
            onStop={() => actions.setFlow("stop")}
            onAddPast={actions.addPastSession}
            onCatch={actions.addCatch}
            onCorrectCatch={actions.correctCatch}
            onShowRules={() => actions.navigate("rules")}
            openMine={statsMineRequested}
            onCatchFlowComplete={actions.completeCatchFlow}
            finishAfterCatch={finishAfterCatch}
            catches={catches}
            activeZone={findZoneName(sessionZone, zones)}
            requestedCatchTime={requestedCatchTime}
            elapsed={elapsed}
            startTime={startTime}
            lastSession={lastSession}
          />
        )}{" "}
        {screen === "more" && <More />}
        <nav className="bottom-nav" aria-label="Hovednavigasjon">
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => {
                actions.navigate(id);
              }}
              className={screen === id ? "selected" : ""}
              aria-current={screen === id ? "page" : undefined}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {id === "stats" && active && <i />}
            </button>
          ))}
        </nav>
        {toast && (
          <div className="toast">
            <Icon name="check" size={18} />
            {toast}
          </div>
        )}
        {flow && (
          <FishingFlow
            mode={flow}
            finish={actions.finishSessionFlow}
            cancel={actions.closeFlow}
            demoStatus={demoStatus}
            startTime={startTime}
            elapsed={elapsed}
            lastSession={lastSession}
            resolveBlock={actions.resolveBlockedStatus}
          />
        )}
        {globalDetail && <Detail title={globalDetail} close={actions.closeDetail} />}
      </div>
      <aside className="prototype-note feature-panel">
        <span>DEMONSTRASJONSMODUS</span>
        <h2>Prøv statusmotoren</h2>
        <p className="demo-intro">
          Velg en situasjon. Valget påvirker statuskontrollen og hva brukeren kan gjøre videre.
        </p>
        <label className="demo-select-label" htmlFor="demo-status">
          Situasjon
        </label>
        <select
          id="demo-status"
          className="demo-select"
          value={demoStatus}
          onChange={(e) => {
            actions.selectDemoStatus(e.target.value as typeof demoStatus);
          }}
        >
          {demoStatuses.map((s) => (
            <option value={s.id} key={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <div className={"demo-result " + selectedDemo.level}>
          <b>
            {selectedDemo.level === "blocked"
              ? "Blokkerer oppstart"
              : selectedDemo.level === "warning"
                ? "Krever vurdering"
                : "Oppstart tillatt"}
          </b>
          <span>{selectedDemo.detail}</span>
        </div>
        <button
          className="demo-start"
          onClick={() => {
            actions.navigate("home");
            actions.setFlow("start");
          }}
        >
          Test valgt situasjon
        </button>
        <div className="feature-divider" />
        <span>FUNKSJONER I PROTOTYPEN</span>
        <ul>
          {features.map((f) => (
            <li key={f}>
              <Icon name="check" size={16} />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <small>
          Prototypen bruker realistiske {activeFishingRules.metadata.seasonYear}-regler. Kart,
          persondata, forhold og statistikk er demonstrasjonsdata.
        </small>
      </aside>
    </main>
  );
}
