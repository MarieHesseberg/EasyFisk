import { FeedbackImage } from "../feedback-message-detail";
import { Icon } from "@/components/ui/icon";
import { FormError } from "@/components/ui/form-error";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { appContentRepository } from "@/data/repositories/app-content";
import type { FeedbackController } from "@/features/feedback/hooks/use-feedback-controller";
import { useLanguage } from "@/components/localization/language-provider";
const { feedback } = appContentRepository.getContent();
export function FeedbackDetailsStep({ controller }: { controller: FeedbackController }) {
  const { t } = useLanguage();
  const {
    category,
    description,
    hasPosition,
    imageError,
    imageName,
    isTouched,
    isValid,
    image,
    position,
    location,
  } = controller.state;
  const { setCategory, setDescription, setHasPosition, selectImage, setIsTouched, setStep } =
    controller.actions;
  return (
    <>
      <div className="form-intro">
        <Icon name="bell" />
        <div>
          <b>{t("copy.hva.vil.du.melde.fra.om.53af8c3")}</b>
          <p>{t("feedback.emergencyWarning")}</p>
        </div>
      </div>
      <label>
        {t("copy.kategori.b796440")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
      </label>
      <div className="feedback-categories">
        {feedback.categories.map((option) => (
          <button
            key={option}
            className={category === option ? "selected" : ""}
            aria-pressed={category === option}
            onClick={() => setCategory(option)}
          >
            {category === option && <Icon name="check" size={14} />}
            <span>{t(option)}</span>
          </button>
        ))}
      </div>
      <label>
        {t("copy.beskrivelse.66239c1")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
        <textarea
          aria-describedby={isTouched && !isValid ? "feedback-error" : undefined}
          aria-invalid={isTouched && !isValid}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={1000}
          placeholder={t("copy.beskriv.hva.du.observerte.hvor.og.omtrent.nar.de.b564e02")}
        />
      </label>
      <div className="character-count">{description.length}/1000</div>
      <FormError
        id="feedback-error"
        message={
          isTouched && !isValid
            ? t("copy.velg.kategori.og.skriv.en.beskrivelse.pa.minst.1.1758154")
            : undefined
        }
      />
      <ImageUploadField
        className="feedback-upload"
        description={t("copy.valgfritt.jpg.png.eller.bilde.fra.kamera.5e898db")}
        error={imageError}
        imageName={imageName}
        selectImage={selectImage}
      />
      <FeedbackImage image={image} name={imageName} />
      <div className="position-card">
        <div>
          <Icon name="pin" />
          <span>
            <b>{t("prototype.testPosition")}</b>
            <small>{t("copy.valgfritt.brukes.bare.til.denne.meldingen.79ad92d")}</small>
          </span>
        </div>
        <button
          className={hasPosition ? "active" : ""}
          aria-pressed={hasPosition}
          disabled={location.isLoading}
          onClick={() => setHasPosition(!hasPosition)}
        >
          {t(
            location.isLoading
              ? "location.loading"
              : hasPosition
                ? "feedback.removePosition"
                : "feedback.addPosition",
          )}
        </button>
        {hasPosition && (
          <p>
            <Icon name="check" size={14} /> {position?.map((n) => n.toFixed(5)).join(", ")} ·{" "}
            {t("copy.posisjon.hentet.med.samtykke.e779358")}
          </p>
        )}
      </div>
      {location.message && !hasPosition && (
        <p role="status">
          {location.isLoading
            ? location.message
            : t(
                location.state === "permission-denied"
                  ? "feedback.locationDenied"
                  : location.state === "insecure"
                    ? "feedback.locationInsecure"
                    : "feedback.locationError",
              )}
        </p>
      )}
      <button
        disabled={location.isLoading}
        className="primary"
        onClick={() => {
          setIsTouched(true);
          if (isValid) setStep(2);
        }}
      >
        {t("copy.kontroller.meldingen.538f52b")}
      </button>
    </>
  );
}
