import { selectLocalized } from "@/locales";
import { CheckRow } from "@/components/ui/check-row";
import { Icon } from "@/components/ui/icon";
import { FormError } from "@/components/ui/form-error";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { getZoneSeasonLabel } from "@/domain/zones/zone-rules";
import type { PastSessionController } from "@/features/history/hooks/use-past-session-controller";
import { formatClock, formatLongDuration } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function ReviewStep({ controller }: { controller: PastSessionController }) {
  const { language, t } = useLanguage();
  const {
    caught,
    dailyValid,
    end,
    openedAt,
    isSubmitting,
    quota,
    reports,
    submissionError,
    withinSeason,
    zone,
    zoneBase,
    zoneName,
  } = controller.state;
  const { removeCatch, setStep, submit } = controller.actions;
  const { quota: ruleQuota } = activeFishingRules;
  const quotaAvailable = quota.seasonAvailable;
  return (
    <>
      <small>{t("copy.historisk.regelkontroll.c378691")}</small>
      <h2>{t("copy.kontroller.turen.f.r.innsending.9e347a9")}</h2>
      <div className="flow-checks">
        <CheckRow
          title={t("copy.fiskekort.pa.valgt.dato.ed60333")}
          sub={selectLocalized(
            language,
            `Fiskekortarkivet er ikke koblet til. Kontroller fiskekortet for ${zoneName} manuelt.`,
            `The permit archive is not connected. Check the permit for ${t(zoneName)} manually.`,
          )}
          state="unavailable"
        />
        <CheckRow
          title={t("copy.fiskesesong.2125fdb")}
          sub={
            withinSeason
              ? selectLocalized(
                  language,
                  `Datoen er innenfor sesongen i ${zoneBase}`,
                  `The date is within the season in ${t(zoneBase)}`,
                )
              : selectLocalized(
                  language,
                  `Valgt dato er utenfor sesongen ${getZoneSeasonLabel(zone)}`,
                  `The selected date is outside the fishing season (${t(getZoneSeasonLabel(zone))})`,
                )
          }
          state={withinSeason ? "ok" : "error"}
        />
        <CheckRow
          title={t("copy.historisk.stengning.32751cc")}
          sub={t("history.closureDataUnavailable")}
          state="unavailable"
        />
        <CheckRow
          title={t("copy.sesongkvote.7476319")}
          sub={
            quotaAvailable
              ? selectLocalized(
                  language,
                  `${quota.remaining} av ${ruleQuota.killedSalmonPerSeason} avlivet gjenstår etter rapporten`,
                  `${quota.remaining} of ${ruleQuota.killedSalmonPerSeason} harvested salmon remain after this report`,
                )
              : t("copy.sesongkvoten.kan.v.re.nadd.6c085f1")
          }
          state={quotaAvailable ? "ok" : "warning"}
        />
        <CheckRow
          title={t("copy.d.gnkvote.ec8d8b1")}
          sub={
            dailyValid
              ? t("copy.maks.en.avlivet.laks.denne.turen.40b3339")
              : t("copy.flere.enn.en.avlivet.laks.er.registrert.9e17c9f")
          }
          state={dailyValid ? "ok" : "error"}
        />
        <CheckRow
          title={t("copy.rapporteringsfrist.a1eaf0c")}
          sub={selectLocalized(
            language,
            `Etterregistreres omtrent ${formatLongDuration(Math.max(0, Math.floor((openedAt - end) / 1000)))} etter turen`,
            `Registered approximately ${formatLongDuration(Math.max(0, Math.floor((openedAt - end) / 1000)), language)} after the trip`,
          )}
          state="warning"
        />
      </div>
      {reports.length > 0 ? (
        <div className="added-catches review">
          {reports.map((x, i) => (
            <button key={x.id} onClick={() => removeCatch(x.id)}>
              <b>
                {t("copy.fangst.04050e7")} {i + 1}: {t(x.species)} · {t(x.result).toLowerCase()}
              </b>
              <span>
                {formatClock(x.caughtAt)} · {x.length} cm · {x.weight} kg
              </span>
              <em>{t("copy.fjern.og.registrer.pa.nytt.ce73570")}</em>
            </button>
          ))}
        </div>
      ) : (
        <div className="selection-recap">
          <Icon name="check" size={17} />
          <span>{t("copy.nullfangst.registreres.for.turen.cf8eabe")}</span>
        </div>
      )}
      <div className="late-report-note">
        <Icon name="clock" size={18} />
        <p>
          <b>{t("copy.rapporten.blir.merket.som.etterregistrert.ecda397")}</b>
          <span>{t("copy.faktisk.tur.og.fangsttid.beholdes.innsendingstid.e1d8785")}</span>
        </p>
      </div>
      <FormError message={submissionError ? t(submissionError) : undefined} />
      <button className="primary" disabled={isSubmitting} onClick={submit}>
        {isSubmitting
          ? t("copy.lagrer.85686f0")
          : selectLocalized(
              language,
              `Lagre tur og ${reports.length} fangst${reports.length === 1 ? "" : "er"}`,
              `Save trip and ${reports.length} ${reports.length === 1 ? "catch" : "catches"}`,
            )}
      </button>
      {caught && (
        <button className="secondary" onClick={() => setStep(2)}>
          {t("copy.legg.til.en.fangst.til.4d97a4f")}
        </button>
      )}
      <button className="text-button" onClick={() => setStep(1)}>
        {t("copy.tilbake.til.turen.20d983d")}
      </button>
    </>
  );
}
