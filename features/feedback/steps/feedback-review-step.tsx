import { appContentRepository } from "@/data/repositories/app-content";
import { FormError } from "@/components/ui/form-error";
import type { FeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
import { useLanguage } from "@/components/localization/language-provider";
const { feedback } = appContentRepository.getContent();
export function FeedbackReviewStep({ controller }: { controller: FeedbackController }) {
  const { t } = useLanguage();
  const {
    category,
    description,
    hasPosition,
    imageName,
    isConfirmed,
    isSubmitting,
    submissionError,
  } = controller.state;
  const { setIsConfirmed, setStep, submit } = controller.actions;
  return (
    <>
      <small>{t("copy.kontroller.f.r.innsending.94790aa")}</small>
      <h3>{t("copy.er.opplysningene.riktige.0ac71b4")}</h3>
      <div className="feedback-review">
        <p>
          <small>{t("copy.kategori.71dd91c")}</small>
          <b>{t(category)}</b>
        </p>
        <p>
          <small>{t("copy.beskrivelse.f3bf7df")}</small>
          <b>{description}</b>
        </p>
        <p>
          <small>{t("copy.bilde.5d25e1d")}</small>
          <b>{imageName || t("copy.ikke.lagt.ved.5c53303")}</b>
        </p>
        <p>
          <small>{t("copy.posisjon.7733e25")}</small>
          <b>
            {hasPosition
              ? `${t(feedback.positionLabel)} · ${t("copy.lagt.ved.med.samtykke.f86e73d")}`
              : t("copy.ikke.lagt.ved.5c53303")}
          </b>
        </p>
      </div>
      <label className="privacy-confirm">
        <input
          type="checkbox"
          checked={isConfirmed}
          onChange={(event) => setIsConfirmed(event.target.checked)}
        />
        <span>
          {t("copy.jeg.bekrefter.at.opplysningene.er.riktige.meldin.c606640")}{" "}
          {feedback.organizationName}.
        </span>
      </label>
      <button className="primary" disabled={!isConfirmed || isSubmitting} onClick={submit}>
        {t(isSubmitting ? "Sender …" : "Send melding")}
      </button>
      <FormError message={submissionError ? t(submissionError) : undefined} />
      <button className="secondary" onClick={() => setStep(1)}>
        {t("copy.tilbake.og.endre.7334721")}
      </button>
    </>
  );
}
