import { Icon } from "@/components/ui/icon";
import type { CatchReportController } from "@/features/catch-report/hooks/use-catch-report-controller";

export function CatchDetailsStep({ controller }: { controller: CatchReportController }) {
  const {
    comment,
    imageError,
    imageName,
    length,
    lengthNumber,
    touched,
    validation,
    weight,
    weightNumber,
  } = controller.state;
  const { continueToReview, selectImage, setComment, setLength, setWeight } = controller.actions;

  return (
    <>
      <small>STEG 2 AV 4 · DETALJER</small>
      <h2>Størrelse og dokumentasjon</h2>
      <div className="input-row">
        <label>
          Lengde <em>påkrevd</em>
          <input
            aria-describedby={
              touched && !validation.detailsValid ? "catch-details-error" : undefined
            }
            aria-invalid={touched && !lengthNumber}
            inputMode="decimal"
            value={length}
            onChange={(event) => setLength(event.target.value)}
            placeholder="cm"
            className={touched && !lengthNumber ? "invalid" : ""}
          />
        </label>
        <label>
          Vekt <em>påkrevd</em>
          <input
            aria-describedby={
              touched && !validation.detailsValid ? "catch-details-error" : undefined
            }
            aria-invalid={touched && !weightNumber}
            inputMode="decimal"
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            placeholder="kg"
            className={touched && !weightNumber ? "invalid" : ""}
          />
        </label>
      </div>
      {touched && !validation.detailsValid && (
        <p className="field-error" id="catch-details-error" role="alert">
          Fyll inn både lengde og vekt med tall større enn 0.
        </p>
      )}
      <label className="upload-box">
        <Icon name="fish" />
        <span>
          <b>{imageName || "Legg til bilde"}</b>
          <small>Valgfritt · bilde av fangsten</small>
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={(event) => selectImage(event.target.files?.[0])}
        />
      </label>
      {imageError && (
        <p className="field-error" role="alert">
          {imageError}
        </p>
      )}
      <label className="comment-label">
        Kommentar <em>valgfritt</em>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={300}
          placeholder="For eksempel observasjoner om fisken eller fangststedet"
        />
        <small>{comment.length}/300</small>
      </label>
      <button className="primary" onClick={continueToReview}>
        Neste · regelkontroll
      </button>
      <button className="secondary" onClick={() => controller.actions.setStep(1)}>
        Tilbake
      </button>
    </>
  );
}
