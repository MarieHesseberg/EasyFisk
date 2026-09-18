import { FeedbackImage } from "../feedback-message-detail";
import { FormError } from "@/components/ui/form-error";
import type { FeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
import { useLanguage } from "@/components/localization/language-provider";
export function FeedbackReviewStep({ controller }: { controller: FeedbackController }) {
  const { t } = useLanguage();
  const {
    category,
    description,
    hasPosition,
    position,
    image,
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
              ? `${position?.map((n) => n.toFixed(5)).join(", ")} · ${t("copy.lagt.ved.med.samtykke.f86e73d")}`
              : t("copy.ikke.lagt.ved.5c53303")}
          </b>
        </p>
      </div>
      <FeedbackImage image={image} name={imageName} />
      <label className="privacy-confirm">
        <input
          type="checkbox"
          checked={isConfirmed}
          onChange={(event) => setIsConfirmed(event.target.checked)}
        />
        <span>{t("prototype.feedbackConsent")}</span>
      </label>
      <button className="primary" disabled={!isConfirmed || isSubmitting} onClick={submit}>
        {t(isSubmitting ? "prototype.saving" : "prototype.testMessage")}
      </button>
      <FormError message={submissionError ? t(submissionError) : undefined} />
      <button className="secondary" disabled={isSubmitting} onClick={() => setStep(1)}>
        {t("copy.tilbake.og.endre.7334721")}
      </button>
    </>
  );
}
