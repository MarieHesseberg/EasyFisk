import { selectLocalized } from "@/locales";
import { Icon } from "@/components/ui/icon";
import { FormError } from "@/components/ui/form-error";
import type { CatchReportController } from "@/features/catch-report/hooks/use-catch-report-controller";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { formatClock } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function CatchReviewStep({
  activeZone,
  caughtAt,
  controller,
}: {
  activeZone: string;
  caughtAt: number;
  controller: CatchReportController;
}) {
  const { language, t } = useLanguage();
  const {
    comment,
    imageName,
    isSubmitting,
    lengthNumber,
    result,
    species,
    submissionError,
    validation,
    violationConfirmed,
    weightNumber,
  } = controller.state;
  const { setStep, setViolationConfirmed, submit } = controller.actions;
  const { blocked, largeSalmon, ruleText, ruleTitle } = validation;
  const { catchSize, metadata } = activeFishingRules;
  return (
    <>
      <small>{t("copy.steg.3.av.4.regelkontroll.288fe43")}</small>
      <h2>{t(blocked ? "Avlivingen bryter størrelsesreglene" : "Rapporten er kontrollert")}</h2>
      <div
        className={"rule-result " + (blocked ? "blocked" : largeSalmon ? "warning" : "approved")}
      >
        <span>{blocked ? "!" : <Icon name="check" />}</span>
        <div>
          <b>{t(ruleTitle)}</b>
          <p>{t(ruleText)}</p>
        </div>
      </div>
      <div className="applied-rules">
        <b>{t("copy.st.rrelsesregler.som.er.kontrollert.65b4c1f")}</b>
        <p>
          <span>{t("copy.minstemal.087f16f")}</span>
          <strong>
            {t("copy.laks.og.sj.rret.bd16ad9")}: {catchSize.minimumCm} cm
          </strong>
        </p>
        <p>
          <span>
            {t("copy.fra.2897b0f")} {metadata.shortVersionLabel}
          </span>
          <strong>
            {selectLocalized(
              language,
              `Én laks opptil ${catchSize.largeSalmonMaximumCm} cm`,
              `One salmon up to ${catchSize.largeSalmonMaximumCm} cm`,
            )}
          </strong>
        </p>
        <p>
          <span>{t("copy.vrige.avlivede.laks.2038bef")}</span>
          <strong>
            {t("copy.under.2a268b8")} {catchSize.regularSalmonMaximumCm} cm
          </strong>
        </p>
        <small>
          {selectLocalized(
            language,
            `Minstemålet er ${catchSize.minimumCm} cm. Regelversjon ${metadata.numericVersionLabel} er brukt.`,
            `The minimum size is ${catchSize.minimumCm} cm. Rule version ${metadata.numericVersionLabel} was applied.`,
          )}
        </small>
      </div>
      <div className="report-summary">
        <p>
          <b>
            {t(species)} · {t(result).toLowerCase()}
          </b>
          <small>
            {lengthNumber} cm · {weightNumber} kg
          </small>
        </p>
        <p>
          <b>{activeZone}</b>
          <small>
            {selectLocalized(
              language,
              `Fangsttid ${formatClock(caughtAt)} · økt og sone er lagt til automatisk`,
              `Catch time ${formatClock(caughtAt)} · session and zone added automatically`,
            )}
          </small>
        </p>
        {imageName && (
          <p>
            <b>{t("copy.bilde.vedlagt.093df22")}</b>
            <small>{imageName}</small>
          </p>
        )}
        {comment && (
          <p>
            <b>{t("copy.kommentar.19c85a8")}</b>
            <small>{comment}</small>
          </p>
        )}
      </div>
      {blocked ? (
        <>
          <label className="violation-confirm">
            <input
              type="checkbox"
              checked={violationConfirmed}
              onChange={(event) => setViolationConfirmed(event.target.checked)}
            />
            <span>
              <b>{t("copy.jeg.forstar.at.avlivingen.ikke.var.tillatt.6cbacec")}</b>
              <small>{t("catch.confirmAccuracy")}</small>
            </span>
          </label>
          <button
            className="primary danger-submit"
            disabled={!violationConfirmed || isSubmitting}
            onClick={submit}
          >
            {t(isSubmitting ? "prototype.saving" : "prototype.saveActualCatch")}
          </button>
        </>
      ) : (
        <button className="primary" disabled={isSubmitting} onClick={submit}>
          {t(isSubmitting ? "prototype.saving" : "prototype.saveCatch")}
        </button>
      )}
      <FormError message={submissionError ? t(submissionError) : undefined} />
      <button className="secondary" onClick={() => setStep(2)}>
        {t("copy.tilbake.og.endre.7334721")}
      </button>
    </>
  );
}
