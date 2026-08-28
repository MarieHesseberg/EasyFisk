import { appContentRepository } from "@/data/repositories/app-content";
import type { FeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
const { feedback } = appContentRepository.getContent();
export function FeedbackReviewStep({ controller }: { controller: FeedbackController }) {
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
      <small>KONTROLLER FØR INNSENDING</small>
      <h3>Er opplysningene riktige?</h3>
      <div className="feedback-review">
        <p>
          <small>KATEGORI</small>
          <b>{category}</b>
        </p>
        <p>
          <small>BESKRIVELSE</small>
          <b>{description}</b>
        </p>
        <p>
          <small>BILDE</small>
          <b>{imageName || "Ikke lagt ved"}</b>
        </p>
        <p>
          <small>POSISJON</small>
          <b>
            {hasPosition ? `${feedback.positionLabel} · lagt ved med samtykke` : "Ikke lagt ved"}
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
          Jeg bekrefter at opplysningene er riktige. Meldingen kan behandles av{" "}
          {feedback.organizationName}.
        </span>
      </label>
      <button className="primary" disabled={!isConfirmed || isSubmitting} onClick={submit}>
        {isSubmitting ? "Sender …" : "Send melding"}
      </button>
      {submissionError && (
        <p className="field-error" role="alert">
          {submissionError}
        </p>
      )}
      <button className="secondary" onClick={() => setStep(1)}>
        Tilbake og endre
      </button>
    </>
  );
}
