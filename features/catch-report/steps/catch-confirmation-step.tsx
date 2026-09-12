import { selectLocalized } from "@/locales";
import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/catches/catch";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import {
  countKilledSalmonForDay,
  getNorwegianCalendarDate,
  getQuotaStatus,
} from "@/domain/quotas/get-quota-status";
import type { CatchReportController } from "@/features/catch-report/hooks/use-catch-report-controller";
import { formatLongDuration } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function CatchConfirmationStep({
  catches,
  controller,
  finishAfterCatch,
  onDone,
}: {
  catches: CatchRecord[];
  controller: CatchReportController;
  finishAfterCatch: boolean;
  onDone: () => void;
}) {
  const { language, t } = useLanguage();
  const { catchSize, quota, reporting } = activeFishingRules;
  const { sentCatch, validation } = controller.state;
  const quotaStatus = getQuotaStatus(catches, []);
  const catchDay = sentCatch
    ? getNorwegianCalendarDate(sentCatch.caughtAt)
    : getNorwegianCalendarDate(Date.now());
  const dailyRemaining = Math.max(
    0,
    quota.killedSalmonPerDay - countKilledSalmonForDay(catches, catchDay),
  );
  return (
    <>
      <div className="sent-icon">
        <Icon name="check" size={32} />
      </div>
      <small>{t("copy.steg.4.av.4.sendt.439db98")}</small>
      <h2>{t("copy.fangstrapporten.er.sendt.3e0f255")}</h2>
      <p className="sent-lead">
        {sentCatch?.late
          ? selectLocalized(
              language,
              `Rapporten ble sendt ${formatLongDuration(Math.floor((sentCatch.submittedAt - sentCatch.caughtAt) / 1000))} etter fangsten og er merket som forsinket.`,
              `The report was submitted ${formatLongDuration(Math.floor((sentCatch.submittedAt - sentCatch.caughtAt) / 1000), language)} after the catch and marked as late.`,
            )
          : selectLocalized(
              language,
              `Rapporten ble sendt ${sentCatch ? formatLongDuration(Math.max(0, Math.floor((sentCatch.submittedAt - sentCatch.caughtAt) / 1000))) : "kort tid"} etter fangsten og innen fristen på ${reporting.deadlineHours} timer.`,
              `The report was submitted ${sentCatch ? formatLongDuration(Math.max(0, Math.floor((sentCatch.submittedAt - sentCatch.caughtAt) / 1000)), language) : "shortly"} after the catch, within the ${reporting.deadlineHours}-hour deadline.`,
            )}
      </p>
      {sentCatch?.late && (
        <div className="violation-sent late">
          <b>{t("copy.forsinket.fangstrapport.e554f1f")}</b>
          <p>{t("catch.actualTimePreserved")}</p>
        </div>
      )}
      {validation.blocked && (
        <div className="violation-sent">
          <b>{t("copy.rapportert.regelavvik.b49e1c8")}</b>
          <p>{t("catch.harvestFollowUp")}</p>
        </div>
      )}
      <div className="quota-update">
        <h3>{t("copy.oppdatert.kvotestatus.be0f642")}</h3>
        <div>
          <span>{t("copy.d.gnkvote.ec8d8b1")}</span>
          <b>
            {selectLocalized(
              language,
              `${dailyRemaining} av ${quota.killedSalmonPerDay} gjenstår`,
              `${dailyRemaining} of ${quota.killedSalmonPerDay} remaining`,
            )}
          </b>
        </div>
        <div>
          <span>{t("copy.sesongkvote.laks.4d55979")}</span>
          <b>
            {selectLocalized(
              language,
              `${quotaStatus.remaining} av ${quota.killedSalmonPerSeason} gjenstår`,
              `${quotaStatus.remaining} of ${quota.killedSalmonPerSeason} remaining`,
            )}
          </b>
        </div>
      </div>
      {validation.largeSalmon && (
        <div className="large-salmon-used">
          <b>{t("copy.storlaks.unntaket.er.brukt.18d641e")}</b>
          <span>
            {selectLocalized(
              language,
              `0 av ${catchSize.largeSalmonAllowance} gjenstår`,
              `0 of ${catchSize.largeSalmonAllowance} remaining`,
            )}
          </span>
        </div>
      )}
      <div className="report-id">
        <small>{t("copy.rapport.id.4b4e7b0")}</small>
        <b>{sentCatch?.id || t("copy.oppretter.rapport.id.22e8a03")}</b>
      </div>
      <button className="primary" onClick={onDone}>
        {t(finishAfterCatch ? "Se sammendrag for økten" : "Ferdig")}
      </button>
    </>
  );
}
