import { FormError } from "@/components/ui/form-error";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import type { CatchReportController } from "@/features/catch-report/hooks/use-catch-report-controller";
import { useLanguage } from "@/components/localization/language-provider";

export function CatchDetailsStep({ controller }: { controller: CatchReportController }) {
  const { t } = useLanguage();
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
      <small>{t("copy.steg.2.av.4.detaljer.45c9ed9")}</small>
      <h2>{t("copy.st.rrelse.og.dokumentasjon.f4c5d39")}</h2>
      <div className="input-row">
        <label>
          {t("copy.lengde.970a8be")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
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
          {t("copy.vekt.f6a2623")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
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
      <FormError
        id="catch-details-error"
        message={
          touched && !validation.detailsValid
            ? t("copy.fyll.inn.bade.lengde.og.vekt.med.tall.st.rre.enn.1fba9fe")
            : undefined
        }
      />
      <ImageUploadField
        className="upload-box"
        description={t("copy.valgfritt.bilde.av.fangsten.6b11a41")}
        error={imageError}
        imageName={imageName}
        selectImage={selectImage}
      />
      <label className="comment-label">
        {t("copy.kommentar.19c85a8")} <em>{t("copy.valgfritt.4a815de")}</em>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={300}
          placeholder={t("copy.for.eksempel.observasjoner.om.fisken.eller.fangs.1506acc")}
        />
        <small>{comment.length}/300</small>
      </label>
      <button className="primary" onClick={continueToReview}>
        {t("copy.neste.regelkontroll.8bdd944")}
      </button>
      <button className="secondary" onClick={() => controller.actions.setStep(1)}>
        {t("copy.tilbake.4fb8dc1")}
      </button>
    </>
  );
}
