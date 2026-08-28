import { CheckRow } from "@/components/ui/check-row";
import { Icon } from "@/components/ui/icon";
import { FormError } from "@/components/ui/form-error";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { getZoneSeasonLabel } from "@/domain/zones/zone-rules";
import type { PastSessionController } from "@/features/history/hooks/use-past-session-controller";
import { formatClock, formatLongDuration } from "@/lib/time";

export function ReviewStep({ controller }: { controller: PastSessionController }) {
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
      <small>HISTORISK REGELKONTROLL</small>
      <h2>Kontroller turen før innsending</h2>
      <div className="flow-checks">
        <CheckRow
          title="Fiskekort på valgt dato"
          sub={`Fiskekortarkivet er ikke koblet til. Kontroller fiskekortet for ${zoneName} manuelt.`}
          state="unavailable"
        />
        <CheckRow
          title="Fiskesesong"
          sub={
            withinSeason
              ? `Datoen er innenfor sesongen i ${zoneBase}`
              : `Valgt dato er utenfor sesongen ${getZoneSeasonLabel(zone)}`
          }
          state={withinSeason ? "ok" : "error"}
        />
        <CheckRow
          title="Historisk stengning"
          sub="Historiske stengningsdata er ikke tilgjengelige. Kontroller reglene for valgt dato manuelt."
          state="unavailable"
        />
        <CheckRow
          title="Sesongkvote"
          sub={
            quotaAvailable
              ? `${quota.remaining} av ${ruleQuota.killedSalmonPerSeason} avlivet gjenstår etter rapporten`
              : "Sesongkvoten kan være nådd"
          }
          state={quotaAvailable ? "ok" : "warning"}
        />
        <CheckRow
          title="Døgnkvote"
          sub={
            dailyValid
              ? "Maks én avlivet laks denne turen"
              : "Flere enn én avlivet laks er registrert"
          }
          state={dailyValid ? "ok" : "error"}
        />
        <CheckRow
          title="Rapporteringsfrist"
          sub={`Etterregistreres omtrent ${formatLongDuration(Math.max(0, Math.floor((openedAt - end) / 1000)))} etter turen`}
          state="warning"
        />
      </div>
      {reports.length > 0 ? (
        <div className="added-catches review">
          {reports.map((x, i) => (
            <button key={x.id} onClick={() => removeCatch(x.id)}>
              <b>
                Fangst {i + 1}: {x.species} · {x.result.toLowerCase()}
              </b>
              <span>
                {formatClock(x.caughtAt)} · {x.length} cm · {x.weight} kg
              </span>
              <em>Fjern og registrer på nytt</em>
            </button>
          ))}
        </div>
      ) : (
        <div className="selection-recap">
          <Icon name="check" size={17} />
          <span>Nullfangst registreres for turen</span>
        </div>
      )}
      <div className="late-report-note">
        <Icon name="clock" size={18} />
        <p>
          <b>Rapporten blir merket som etterregistrert</b>
          <span>Faktisk tur- og fangsttid beholdes. Innsendingstid registreres separat.</span>
        </p>
      </div>
      <FormError message={submissionError} />
      <button className="primary" disabled={isSubmitting} onClick={submit}>
        {isSubmitting ? "Lagrer …" : "Send inn tur"} og {reports.length} fangst
        {reports.length === 1 ? "" : "er"}
      </button>
      {caught && (
        <button className="secondary" onClick={() => setStep(2)}>
          Legg til en fangst til
        </button>
      )}
      <button className="text-button" onClick={() => setStep(1)}>
        Tilbake til turen
      </button>
    </>
  );
}
