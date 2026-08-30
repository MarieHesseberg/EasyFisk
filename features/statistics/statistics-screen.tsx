"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import {
  mandalselvaSeasonStatistics,
  mandalselvaStatisticsSource,
} from "@/data/statistics/mandalselva-statistics";
import type { CatchRecord } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import type { AsyncOperationResult } from "@/domain/shared/operation-result";
import { calculatePersonalStatistics } from "@/domain/statistics/calculate-personal-statistics";
import {
  calculateAverageWeight,
  calculateChangeFromPrevious,
} from "@/domain/statistics/river-statistics";
import { FishingActivityScreen } from "@/features/fishing-session/fishing-activity-screen";
import { PersonalStatisticsPanel } from "@/features/statistics/personal-statistics-panel";

const numberFormatter = new Intl.NumberFormat("nb-NO");
const decimalFormatter = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function StatisticsOverview() {
  const latest = mandalselvaSeasonStatistics.at(-1)!;
  const [selectedYear, setSelectedYear] = useState(latest.year);
  const selectedIndex = mandalselvaSeasonStatistics.findIndex(({ year }) => year === selectedYear);
  const selected = mandalselvaSeasonStatistics[selectedIndex];
  const previous = mandalselvaSeasonStatistics[selectedIndex - 1];
  const change = calculateChangeFromPrevious(selected, previous);
  const maximumCatch = Math.max(
    ...mandalselvaSeasonStatistics.map(({ salmonCount }) => salmonCount),
  );
  return (
    <>
      <div className="filter-row">
        <span>Hele Mandalselva</span>
        <label>
          <span>Sesong</span>
          <select
            aria-label="Velg sesong"
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
          >
            {[...mandalselvaSeasonStatistics].reverse().map(({ year }) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <section className="hero-stat">
        <small>RAPPORTERT LAKS · {selected.year}</small>
        <strong>{numberFormatter.format(selected.salmonCount)}</strong>
        <div>
          <span>Offisiell fangststatistikk</span> for hele Mandalselva
        </div>
      </section>
      <div className="stat-grid">
        <Stat
          icon="fish"
          label="LAKS · KILOGRAM"
          value={numberFormatter.format(selected.salmonWeightKg)}
        />
        <Stat
          icon="stats"
          label="SNITTVEKT LAKS"
          value={`${decimalFormatter.format(calculateAverageWeight(selected))} kg`}
        />
        <Stat
          icon="fish"
          label="SJØØRRET · ANTALL"
          value={numberFormatter.format(selected.seaTroutCount)}
        />
        <Stat
          icon="clock"
          label="ENDRING FRA ÅRET FØR"
          value={
            change === null ? "–" : `${change > 0 ? "+" : ""}${decimalFormatter.format(change)} %`
          }
        />
      </div>
      <section className="chart-card">
        <h3>Rapportert laks per sesong</h3>
        <div className="bar-chart" aria-label="Antall rapporterte laks fra 2021 til 2025">
          {mandalselvaSeasonStatistics.map(({ year, salmonCount }) => (
            <div key={year} className={year === selectedYear ? "selected" : undefined}>
              <span style={{ height: `${(salmonCount / maximumCatch) * 100}%` }} />
              <small>{year}</small>
            </div>
          ))}
        </div>
      </section>
      <p className="privacy-note">
        Kilde:{" "}
        <a href={mandalselvaStatisticsSource.url} target="_blank" rel="noreferrer">
          {mandalselvaStatisticsSource.label}
        </a>
        , {mandalselvaStatisticsSource.updatedLabel}. Tallene gjelder hele vassdraget og er ikke
        fordelt på fiskesoner.
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
  onAddPast: (record: SessionRecord, catchRecords?: CatchRecord[]) => AsyncOperationResult<unknown>;
  onCatch: (record: CatchRecord) => AsyncOperationResult<unknown>;
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
