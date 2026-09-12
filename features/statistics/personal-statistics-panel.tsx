import { selectLocalized } from "@/locales";
import { Icon } from "@/components/ui/icon";
import type { PersonalStatistics } from "@/domain/statistics/calculate-personal-statistics";
import { formatLongDuration } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
import { formatDecimal, formatNumber } from "@/lib/localization-format";
export function PersonalStatisticsPanel({ statistics }: { statistics: PersonalStatistics }) {
  const { language, t } = useLanguage();
  const hasHistory = statistics.sessionCount > 0 || statistics.catchCount > 0;
  return (
    <section className="personal-statistics" aria-labelledby="personal-statistics-title">
      <div className="section-head">
        <div>
          <small>{t("copy.beregnet.fra.dine.lokale.data.ecd8e12")}</small>
          <h2 id="personal-statistics-title">{t("copy.din.statistikk.d5b8cf2")}</h2>
        </div>
      </div>

      {!hasHistory && <p className="personal-statistics-empty">{t("statistics.emptyPersonal")}</p>}

      <div className="personal-statistics-grid">
        <Statistic
          icon="clock"
          label={t("copy.fisketid.977c981")}
          value={formatLongDuration(statistics.fishingSeconds, language)}
        />
        <Statistic
          icon="pin"
          label={t("copy.fiske.kter.f9a8b17")}
          value={formatNumber(statistics.sessionCount, language)}
        />
        <Statistic
          icon="fish"
          label={t("copy.fangster.03afa4a")}
          value={formatNumber(statistics.catchCount, language)}
        />
        <Statistic
          icon="check"
          label={t("copy.gjenutsatt.9069fd0")}
          value={formatNumber(statistics.releasedCount, language)}
        />
      </div>

      <div className="personal-catch-summary">
        <span>
          {t("copy.laks.2d51eba")}: {statistics.salmonCount}
        </span>
        <span>
          {t("copy.sj.rret.dfdd49a")}: {statistics.seaTroutCount}
        </span>
        <span>
          {t("copy.annen.art.5ff0d45")}: {statistics.otherSpeciesCount}
        </span>
        <span>
          {t("copy.nullfangst.kter.5cfae9e")}: {statistics.zeroCatchSessionCount}
        </span>
        <span>
          {t("copy.fangst.per.10.timer.0297c1d")}:{" "}
          {formatDecimal(statistics.catchesPerTenHours, language)}
        </span>
      </div>

      <div className="personal-quota-card">
        <h3>{t("copy.personlig.laksekvote.6b7582e")}</h3>
        <QuotaRows label={t("copy.avlivet.laks.5088826")} quota={statistics.killedSalmonQuota} />
        <QuotaRows
          label={t("copy.gjenutsatt.laks.a16cd1c")}
          quota={statistics.releasedSalmonQuota}
        />
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
  const { t } = useLanguage();
  return (
    <div className="personal-quota-group">
      <b>{label}</b>
      <QuotaRow
        label={t("copy.i.dag.3c5f8fb")}
        used={quota.usedToday}
        limit={quota.dailyLimit}
        remaining={quota.remainingToday}
      />
      <QuotaRow
        label={t("copy.denne.sesongen.17f8792")}
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
  const { language } = useLanguage();
  return (
    <div className="personal-quota-row">
      <div>
        <span>{label}</span>
        <span>
          {selectLocalized(
            language,
            `${used} av ${limit} brukt · ${remaining} igjen`,
            `${used} of ${limit} used · ${remaining} remaining`,
          )}
        </span>
      </div>
      <progress
        value={used}
        max={limit}
        aria-label={selectLocalized(
          language,
          `${label}: ${used} av ${limit} brukt`,
          `${label}: ${used} of ${limit} used`,
        )}
      />
    </div>
  );
}
