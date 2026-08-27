"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { demoStatuses } from "@/data/mock/fishing-data";
import { completeCatchRecord } from "@/domain/catches/complete-catch-record";
import { findDemoStatus } from "@/domain/fishing-rules/find-demo-status";
import { getStatusResolution } from "@/domain/fishing-rules/status-checks";
import type { CatchRecord, DemoStatus, FlowMode, Screen, SessionRecord } from "@/domain/models";
import { countKilledSalmon } from "@/domain/quotas/count-killed-salmon";
import { createSessionRecord } from "@/domain/sessions/create-session-record";
import { findZoneName } from "@/domain/zones/find-zone-name";
import { FishingFlow } from "@/features/fishing-session/fishing-flow";
import { Home } from "@/features/home/home-screen";
import { MapScreen } from "@/features/map/map-screen";
import { Detail } from "@/features/profile/detail";
import { More } from "@/features/profile/more-screen";
import { RulesScreen } from "@/features/rules/rules-screen";
import { Stats } from "@/features/statistics/statistics-screen";
import { useSessionTimer } from "@/hooks/use-session-timer";
import { useTimedToast } from "@/hooks/use-timed-toast";

export function EasyFiskApp() {
  const [screen, setScreen] = useState<Screen>("home"),
    [active, setActive] = useState(false),
    [zone, setZone] = useState(3),
    [flow, setFlow] = useState<FlowMode | null>(null),
    [demoStatus, setDemoStatus] = useState<DemoStatus>("ok"),
    [startTime, setStartTime] = useState<number | null>(null),
    [lastSession, setLastSession] = useState<SessionRecord | null>(null),
    [globalDetail, setGlobalDetail] = useState(""),
    [catches, setCatches] = useState<CatchRecord[]>([]),
    [finishAfterCatch, setFinishAfterCatch] = useState(false),
    [sessionZone, setSessionZone] = useState(3),
    [requestedCatchTime, setRequestedCatchTime] = useState(0),
    [statsMineRequested, setStatsMineRequested] = useState(false);
  const { elapsed, setElapsed } = useSessionTimer(active, startTime);
  const { message: toast, showToast } = useTimedToast();
  const nav = [
    ["home", "Hjem", "home"],
    ["map", "Kart", "map"],
    ["rules", "Regler", "book"],
    ["stats", "Statistikk", "stats"],
    ["more", "Mer", "more"],
  ] as const;
  const openFlow = () => setFlow(active ? "stop" : "start");
  const finish = (caught?: boolean, selectedZone?: number) => {
    if (flow === "start") {
      const now = Date.now();
      setSessionZone(selectedZone ?? zone);
      setStartTime(now);
      setElapsed(0);
      setActive(true);
      setFlow(null);
      showToast(`Fiskeøkten er startet i Sone ${selectedZone ?? zone}`);
      setScreen("stats");
    } else if (flow === "stop") {
      if (caught) {
        setFlow(null);
        setScreen("stats");
        setFinishAfterCatch(true);
        setRequestedCatchTime(Date.now());
      } else {
        const end = Date.now();
        const start = startTime ?? end;
        const session = createSessionRecord(
          start,
          end,
          findZoneName(sessionZone),
          "Nullfangst registrert",
        );
        setElapsed(session.duration);
        setLastSession(session);
        setActive(false);
        setFlow("summary");
      }
    } else {
      setFlow(null);
      setScreen("home");
    }
  };
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
  const selectedDemo = findDemoStatus(demoStatus);
  return (
    <main className="prototype-shell">
      <div className="phone-app">
        {screen === "home" && (
          <Home
            onStart={openFlow}
            onRules={() => setScreen("rules")}
            onFeedback={() => setGlobalDetail("Tilbakemelding")}
            onControlCard={() => setGlobalDetail("Kontrollkort")}
            onCatchShortcut={() => {
              setStatsMineRequested(true);
              setScreen("stats");
            }}
            onMapShortcut={() => setScreen("map")}
            active={active}
            elapsed={elapsed}
            startTime={startTime}
            demoStatus={demoStatus}
            salmonKilled={countKilledSalmon(catches)}
          />
        )}{" "}
        {screen === "map" && (
          <MapScreen
            selected={zone}
            setSelected={setZone}
            onUseZone={(selected) => {
              setZone(selected);
              setSessionZone(selected);
              setScreen("home");
              setFlow("start");
            }}
          />
        )}{" "}
        {screen === "rules" && (
          <RulesScreen
            demoStatus={demoStatus}
            onRegisterPermit={() => setGlobalDetail("Mine fiskekort")}
          />
        )}{" "}
        {screen === "stats" && (
          <Stats
            active={active}
            onStart={() => setFlow("start")}
            onStop={() => setFlow("stop")}
            onAddPast={(record, catchRecords) => {
              setLastSession(record);
              if (catchRecords?.length) {
                const submittedAt = Date.now();
                setCatches((current) => [
                  ...current,
                  ...catchRecords.map((catchRecord, index) =>
                    completeCatchRecord(
                      catchRecord,
                      catchRecord.id === "pending"
                        ? `ME-${submittedAt}-${index + 1}`
                        : catchRecord.id,
                      submittedAt,
                    ),
                  ),
                ]);
              }
              showToast("Tidligere fisketur er registrert");
            }}
            onCatch={(record) => {
              const now = Date.now();
              const savedRecord = completeCatchRecord(record, `ME-${now}`, now);
              setCatches((current) => [...current, savedRecord]);
              showToast("Fangsten er lagret og kvoten er oppdatert");
              if (finishAfterCatch) {
                const end = Date.now();
                const start = startTime ?? end;
                setLastSession(
                  createSessionRecord(
                    start,
                    end,
                    record.zone,
                    `1 ${record.species.toLowerCase()} · ${record.result.toLowerCase()}`,
                  ),
                );
                setActive(false);
              }
            }}
            onCorrectCatch={(id, note) =>
              setCatches((current) =>
                current.map((item) => (item.id === id ? { ...item, correction: note } : item)),
              )
            }
            onShowRules={() => setScreen("rules")}
            openMine={statsMineRequested}
            onCatchFlowComplete={() => {
              setFinishAfterCatch(false);
              setFlow("summary");
            }}
            finishAfterCatch={finishAfterCatch}
            catches={catches}
            activeZone={findZoneName(sessionZone)}
            requestedCatchTime={requestedCatchTime}
            elapsed={elapsed}
            startTime={startTime}
            lastSession={lastSession}
          />
        )}{" "}
        {screen === "more" && <More />}
        <nav className="bottom-nav">
          {nav.map(([id, label, icon]) => (
            <button
              key={id}
              onClick={() => {
                if (id === "stats") setStatsMineRequested(false);
                setScreen(id);
              }}
              className={screen === id ? "selected" : ""}
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
            finish={finish}
            cancel={() => setFlow(null)}
            demoStatus={demoStatus}
            startTime={startTime}
            elapsed={elapsed}
            lastSession={lastSession}
            resolveBlock={() => {
              setFlow(null);
              setGlobalDetail(getStatusResolution(demoStatus));
            }}
          />
        )}
        {globalDetail && <Detail title={globalDetail} close={() => setGlobalDetail("")} />}
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
            setDemoStatus(e.target.value as DemoStatus);
            setActive(false);
            setFlow(null);
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
            setScreen("home");
            setFlow("start");
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
          Prototypen bruker realistiske 2026-regler. Kart, persondata, forhold og statistikk er
          demonstrasjonsdata.
        </small>
      </aside>
    </main>
  );
}
