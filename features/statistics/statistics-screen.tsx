"use client";

import { useState } from "react";
import { Header } from "@/components/ui/header";
import { Icon } from "@/components/ui/icon";
import { zones } from "@/data/mock/fishing-data";
import type { CatchRecord, SessionRecord } from "@/domain/models";
import { Activity } from "@/features/fishing-session/activity-screen";

export function StatsContent() {
  const [area, setArea] = useState("Hele elva"),
    [period, setPeriod] = useState("Sesongen");
  return (
    <>
      <div className="filter-row">
        <button
          onClick={() =>
            setArea(area === "Hele elva" ? "Sone 3" : area === "Sone 3" ? "Sone 4" : "Hele elva")
          }
        >
          {area}⌄
        </button>
        <button
          onClick={() =>
            setPeriod(
              period === "Sesongen"
                ? "Siste 30 dager"
                : period === "Siste 30 dager"
                  ? "Denne uken"
                  : "Sesongen",
            )
          }
        >
          {period}⌄
        </button>
      </div>
      <section className="hero-stat">
        <small>REGISTRERTE FANGSTER · EKSEMPEL</small>
        <strong>286</strong>
        <div>
          <span>Fangst + innsats</span> gir bedre forvaltningsdata
        </div>
      </section>
      <div className="stat-grid">
        <Stat icon="clock" label="FISKETIMER" value="4 820" />
        <Stat icon="stats" label="FANGST / 10 T" value="0,59" />
        <Stat icon="fish" label="GJENUTSATT" value="64 %" />
        <Stat icon="user" label="FISKEØKTER" value="418" />
      </div>
      <section className="chart-card">
        <h3>Fangst gjennom sesongen</h3>
        <div className="bar-chart">
          {[18, 32, 46, 66, 87, 74, 54, 41, 25].map((h, i) => (
            <div key={i}>
              <span style={{ height: h + "%" }} />
              <small>{i % 2 === 0 ? "U" + (23 + i) : ""}</small>
            </div>
          ))}
        </div>
      </section>
      <section className="chart-card">
        <h3>Fangst per hovedsone</h3>
        {zones.map((z, i) => (
          <div className="zone-bar" key={z.id}>
            <span>Sone {z.id}</span>
            <div>
              <i style={{ width: [72, 91, 84, 58][i] + "%" }} />
            </div>
            <b>{[58, 79, 73, 46][i]}</b>
          </div>
        ))}
      </section>
      <p className="privacy-note">
        Tallene demonstrerer ønsket funksjon. De er ikke offisielle 2026-tall. Statistikk skal
        aggregeres uten å vise enkeltfiskeres posisjon.
      </p>
    </>
  );
}
export function Stats({
  active,
  onStart,
  onStop,
  onAddPast,
  onCatch,
  onCatchFlowComplete,
  finishAfterCatch,
  catches,
  activeZone,
  requestedCatchTime,
  onCorrectCatch,
  onShowRules,
  openMine,
  elapsed,
  startTime,
  lastSession,
}: {
  active: boolean;
  onStart: () => void;
  onStop: () => void;
  onAddPast: (record: SessionRecord, catchRecords?: CatchRecord[]) => void;
  onCatch: (record: CatchRecord) => void;
  onCatchFlowComplete: () => void;
  finishAfterCatch: boolean;
  catches: CatchRecord[];
  activeZone: string;
  requestedCatchTime: number;
  onCorrectCatch: (id: string, note: string) => void;
  onShowRules: () => void;
  openMine: boolean;
  elapsed: number;
  startTime: number | null;
  lastSession: SessionRecord | null;
}) {
  const [view, setView] = useState<"general" | "mine">(active || openMine ? "mine" : "general");
  return (
    <div className="screen">
      <Header title="Statistikk" eyebrow="FANGST, INNSATS OG HISTORIKK" />
      <div className="stats-tabs">
        <button className={view === "general" ? "selected" : ""} onClick={() => setView("general")}>
          Generell statistikk
        </button>
        <button className={view === "mine" ? "selected" : ""} onClick={() => setView("mine")}>
          Min fangst og fiskehistorikk
        </button>
      </div>
      {view === "general" ? (
        <StatsContent />
      ) : (
        <Activity
          embedded
          active={active}
          onStart={onStart}
          onStop={onStop}
          onAddPast={onAddPast}
          onCatch={onCatch}
          onCatchFlowComplete={onCatchFlowComplete}
          finishAfterCatch={finishAfterCatch}
          catches={catches}
          activeZone={activeZone}
          requestedCatchTime={requestedCatchTime}
          onCorrectCatch={onCorrectCatch}
          onShowRules={onShowRules}
          elapsed={elapsed}
          startTime={startTime}
          lastSession={lastSession}
        />
      )}
    </div>
  );
}
function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <article>
      <Icon name={icon} />
      <small>{label}</small>
      <b>{value}</b>
    </article>
  );
}
