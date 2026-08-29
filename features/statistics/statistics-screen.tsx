"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { appContentRepository } from "@/data/repositories/app-content";
import type { CatchRecord } from "@/domain/catches/catch";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import type { SessionRecord } from "@/domain/sessions/session";
import type { OperationResult } from "@/domain/shared/operation-result";
import { calculatePersonalStatistics } from "@/domain/statistics/calculate-personal-statistics";
import { FishingActivityScreen } from "@/features/fishing-session/fishing-activity-screen";
import { PersonalStatisticsPanel } from "@/features/statistics/personal-statistics-panel";

const zones = fishingContentRepository.getZones();
const { statistics } = appContentRepository.getContent();

function nextOption(current: string, options: readonly string[]) {
  return options[(options.indexOf(current) + 1) % options.length];
}

export function StatisticsOverview() {
  const [area, setArea] = useState(statistics.areas[0]),
    [period, setPeriod] = useState(statistics.periods[0]);
  return (
    <>
      <div className="filter-row">
        <button onClick={() => setArea(nextOption(area, statistics.areas))}>{area}⌄</button>
        <button onClick={() => setPeriod(nextOption(period, statistics.periods))}>{period}⌄</button>
      </div>
      <section className="hero-stat">
        <small>REGISTRERTE FANGSTER · EKSEMPEL</small>
        <strong>{statistics.totalCatches}</strong>
        <div>
          <span>Fangst + innsats</span> gir bedre forvaltningsdata
        </div>
      </section>
      <div className="stat-grid">
        {statistics.metrics.map((metric) => (
          <Stat key={metric.label} {...metric} />
        ))}
      </div>
      <section className="chart-card">
        <h3>Fangst gjennom sesongen</h3>
        <div className="bar-chart">
          {statistics.weeklyCatchPercentages.map((h, i) => (
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
              <i style={{ width: statistics.zoneCatchPercentages[i] + "%" }} />
            </div>
            <b>{statistics.zoneCatchTotals[i]}</b>
          </div>
        ))}
      </section>
      <p className="privacy-note">
        Tallene demonstrerer ønsket funksjon. De er ikke offisielle{" "}
        {activeFishingRules.metadata.seasonYear}-tall. Statistikk skal aggregeres uten å vise
        enkeltfiskeres posisjon.
      </p>
    </>
  );
}
export function StatisticsScreen({
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
  openPastSession,
  elapsed,
  startTime,
  sessions,
}: {
  active: boolean;
  onStart: () => void;
  onStop: () => void;
  onAddPast: (record: SessionRecord, catchRecords?: CatchRecord[]) => OperationResult<unknown>;
  onCatch: (record: CatchRecord) => OperationResult<unknown>;
  onCatchFlowComplete: () => void;
  finishAfterCatch: boolean;
  catches: CatchRecord[];
  activeZone: string;
  requestedCatchTime: number;
  onCorrectCatch: (id: string, note: string) => void;
  onShowRules: () => void;
  openMine: boolean;
  openPastSession: boolean;
  elapsed: number;
  startTime: number | null;
  sessions: SessionRecord[];
}) {
  const [view, setView] = useState<"general" | "mine">(active || openMine ? "mine" : "general");
  return (
    <div className="screen">
      <ScreenHeader title="Statistikk" eyebrow="FANGST, INNSATS OG HISTORIKK" />
      <div className="stats-tabs">
        <button
          className={view === "general" ? "selected" : ""}
          aria-pressed={view === "general"}
          onClick={() => setView("general")}
        >
          Generell statistikk
        </button>
        <button
          className={view === "mine" ? "selected" : ""}
          aria-pressed={view === "mine"}
          onClick={() => setView("mine")}
        >
          Min fangst og fiskehistorikk
        </button>
      </div>
      {view === "general" ? (
        <StatisticsOverview />
      ) : (
        <>
          <PersonalStatisticsPanel statistics={calculatePersonalStatistics(catches, sessions)} />
          <FishingActivityScreen
            embedded
            openPastSession={openPastSession}
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
            sessions={sessions}
          />
        </>
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
