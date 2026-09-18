"use client";

import { useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import {
  mandalselvaSeasonStatistics,
  mandalselvaStatisticsSource,
} from "@/data/statistics/mandalselva-statistics";
import type { CatchEdit, CatchRecord } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import type { AsyncOperationResult } from "@/domain/shared/operation-result";
import { calculatePersonalStatistics } from "@/domain/statistics/calculate-personal-statistics";
import {
  calculateAverageWeight,
  calculateChangeFromPrevious,
} from "@/domain/statistics/river-statistics";
import { FishingActivityScreen } from "@/features/fishing-session/fishing-activity-screen";
import { PersonalStatisticsPanel } from "@/features/statistics/personal-statistics-panel";
import { useLanguage } from "@/components/localization/language-provider";
import { formatDecimal, formatNumber } from "@/lib/localization-format";

export function StatisticsOverview() {
  const { language, t } = useLanguage();
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
        <span>{t("copy.hele.mandalselva.cfd16f7")}</span>
        <label>
          <span>{t("copy.sesong.a17a572")}</span>
          <select
            aria-label={t("copy.velg.sesong.b85e3c2")}
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
        <small>
          {t("copy.rapportert.laks.7823afb")} · {selected.year}
        </small>
        <strong>{formatNumber(selected.salmonCount, language)}</strong>
        <div>
          <span>{t("copy.offisiell.fangststatistikk.0837bf8")}</span>{" "}
          {t("copy.for.hele.mandalselva.2d78096")}
        </div>
      </section>
      <div className="stat-grid">
        <Stat
          icon="fish"
          label={t("copy.laks.kilogram.5e38fbb")}
          value={formatNumber(selected.salmonWeightKg, language)}
        />
        <Stat
          icon="stats"
          label={t("copy.snittvekt.laks.f8afee9")}
          value={`${formatDecimal(calculateAverageWeight(selected), language)} kg`}
        />
        <Stat
          icon="fish"
          label={t("copy.sj.rret.antall.c5d032c")}
          value={formatNumber(selected.seaTroutCount, language)}
        />
        <Stat
          icon="clock"
          label={t("copy.endring.fra.aret.f.r.e9b671e")}
          value={
            change === null ? "–" : `${change > 0 ? "+" : ""}${formatDecimal(change, language)} %`
          }
        />
      </div>
      <section className="chart-card">
        <h3>{t("copy.rapportert.laks.per.sesong.f5f5c8c")}</h3>
        <div
          className="bar-chart"
          aria-label={t("copy.antall.rapporterte.laks.fra.2021.til.2025.e039899")}
        >
          {mandalselvaSeasonStatistics.map(({ year, salmonCount }) => (
            <div key={year} className={year === selectedYear ? "selected" : undefined}>
              <span style={{ height: `${(salmonCount / maximumCatch) * 100}%` }} />
              <small>{year}</small>
            </div>
          ))}
        </div>
      </section>
      <p className="privacy-note">
        {t("copy.kilde.19613cc")}{" "}
        <a href={mandalselvaStatisticsSource.url} target="_blank" rel="noreferrer">
          {t(mandalselvaStatisticsSource.label)}
        </a>
        , {t(mandalselvaStatisticsSource.updatedLabel)}.{" "}
        {t("copy.tallene.gjelder.hele.vassdraget.og.er.ikke.forde.d5fb770")}
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
  onCorrectCatch: (
    id: string,
    note: string | CatchEdit,
  ) => import("@/domain/shared/operation-result").OperationResult<void> | void;
  onShowRules: () => void;
  openMine: boolean;
  openPastSession: boolean;
  elapsed: number;
  startTime: number | null;
  sessions: SessionRecord[];
}) {
  const { t } = useLanguage();
  const [view, setView] = useState<"general" | "mine">(active || openMine ? "mine" : "general");
  return (
    <div className="screen">
      <ScreenHeader
        title={t("copy.statistikk.46cd4af")}
        eyebrow={t("copy.fangst.innsats.og.historikk.76981fa")}
      />
      <div className="stats-tabs">
        <button
          className={view === "general" ? "selected" : ""}
          aria-pressed={view === "general"}
          onClick={() => setView("general")}
        >
          {t("copy.generell.statistikk.e3d13df")}
        </button>
        <button
          className={view === "mine" ? "selected" : ""}
          aria-pressed={view === "mine"}
          onClick={() => setView("mine")}
        >
          {t("copy.min.fangst.og.fiskehistorikk.8f3bbeb")}
        </button>
      </div>
      {view === "general" ? (
        <StatisticsOverview />
      ) : (
        <>
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
          <PersonalStatisticsPanel statistics={calculatePersonalStatistics(catches, sessions)} />
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
