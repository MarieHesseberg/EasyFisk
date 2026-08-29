import { Icon } from "@/components/ui/icon";
import type { PersonalStatistics } from "@/domain/statistics/calculate-personal-statistics";
import { formatLongDuration } from "@/lib/time";

export function PersonalStatisticsPanel({ statistics }: { statistics: PersonalStatistics }) {
  const hasHistory = statistics.sessionCount > 0 || statistics.catchCount > 0;

  return (
    <section className="personal-statistics" aria-labelledby="personal-statistics-title">
      <div className="section-head">
        <div>
          <small>BEREGNET FRA DINE LOKALE DATA</small>
          <h2 id="personal-statistics-title">Din statistikk</h2>
        </div>
      </div>

      {!hasHistory && (
        <p className="personal-statistics-empty">
          Statistikken fylles ut når du avslutter en fiskeøkt eller registrerer en tidligere tur.
        </p>
      )}

      <div className="personal-statistics-grid">
        <Statistic
          icon="clock"
          label="Fisketid"
          value={formatLongDuration(statistics.fishingSeconds)}
        />
        <Statistic icon="pin" label="Fiskeøkter" value={String(statistics.sessionCount)} />
        <Statistic icon="fish" label="Fangster" value={String(statistics.catchCount)} />
        <Statistic icon="check" label="Gjenutsatt" value={String(statistics.releasedCount)} />
      </div>

      <div className="personal-catch-summary">
        <span>Laks: {statistics.salmonCount}</span>
        <span>Sjøørret: {statistics.seaTroutCount}</span>
        <span>Annen art: {statistics.otherSpeciesCount}</span>
        <span>Nullfangstøkter: {statistics.zeroCatchSessionCount}</span>
        <span>Fangst per 10 timer: {formatDecimal(statistics.catchesPerTenHours)}</span>
      </div>

      <div className="personal-quota-card">
        <h3>Personlig laksekvote</h3>
        <QuotaRows label="Avlivet laks" quota={statistics.killedSalmonQuota} />
        <QuotaRows label="Gjenutsatt laks" quota={statistics.releasedSalmonQuota} />
      </div>
    </section>
  );
}

function Statistic({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <article>
      <Icon name={icon} size={20} />
      <small>{label}</small>
      <strong>{value}</strong>
    </article>
  );
}

function QuotaRows({
  label,
  quota,
}: {
  label: string;
  quota: PersonalStatistics["killedSalmonQuota"];
}) {
  return (
    <div className="personal-quota-group">
      <b>{label}</b>
      <QuotaRow
        label="I dag"
        used={quota.usedToday}
        limit={quota.dailyLimit}
        remaining={quota.remainingToday}
      />
      <QuotaRow
        label="Denne sesongen"
        used={quota.usedThisSeason}
        limit={quota.seasonLimit}
        remaining={quota.remainingThisSeason}
      />
    </div>
  );
}

function QuotaRow({
  label,
  used,
  limit,
  remaining,
}: {
  label: string;
  used: number;
  limit: number;
  remaining: number;
}) {
  return (
    <div className="personal-quota-row">
      <div>
        <span>{label}</span>
        <span>
          {used} av {limit} brukt · {remaining} igjen
        </span>
      </div>
      <progress value={used} max={limit} aria-label={`${label}: ${used} av ${limit} brukt`} />
    </div>
  );
}

function formatDecimal(value: number) {
  return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 1 }).format(value);
}
