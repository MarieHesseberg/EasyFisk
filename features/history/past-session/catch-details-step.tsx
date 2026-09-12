import { selectLocalized } from "@/locales";
import { FormError } from "@/components/ui/form-error";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { catchOutcomeOptions, fishSpeciesOptions } from "@/domain/catches/catch";
import type { PastSessionController } from "@/features/history/hooks/use-past-session-controller";
import { formatClock } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function CatchDetailsStep({ controller }: { controller: PastSessionController }) {
  const { language, t } = useLanguage();
  const {
    catchAt,
    catchValid,
    comment,
    imageError,
    imageName,
    length,
    lengthNumber,
    outcome,
    reports,
    species,
    touched,
    validCatchTime,
    weight,
    weightNumber,
  } = controller.state;
  const {
    addCatch,
    selectImage,
    setCatchAt,
    setComment,
    setLength,
    setOutcome,
    setSpecies,
    setStep,
    setWeight,
  } = controller.actions;
  return (
    <>
      <small>
        {t("copy.etterregistrering.fangst.f4b6896")} {reports.length + 1}
      </small>
      <h2>{t("copy.registrer.fangsten.320a200")}</h2>
      {reports.length > 0 && (
        <div className="added-catches">
          <b>
            {selectLocalized(
              language,
              `${reports.length} fangst${reports.length === 1 ? "" : "er"} lagt til`,
              `${reports.length} ${reports.length === 1 ? "catch" : "catches"} added`,
            )}
          </b>
          {reports.map((x) => (
            <span key={x.id}>
              {t(x.species)} · {t(x.result).toLowerCase()} · {formatClock(x.caughtAt)}
            </span>
          ))}
        </div>
      )}
      <label>
        {t("copy.faktisk.fangsttid.f0af7b2")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
        <input
          aria-describedby={touched && !catchValid ? "past-catch-error" : undefined}
          aria-invalid={touched && !validCatchTime}
          type="time"
          value={catchAt}
          onChange={(e) => setCatchAt(e.target.value)}
        />
      </label>
      <label>{t("copy.art.308e17d")}</label>
      <div className="choice">
        {fishSpeciesOptions.map((x) => (
          <button
            key={x}
            className={species === x ? "selected" : ""}
            aria-pressed={species === x}
            onClick={() => setSpecies(x)}
          >
            {t(x)}
          </button>
        ))}
      </div>
      <label>{t("copy.resultat.c9f6c1d")}</label>
      <div className="choice two">
        {catchOutcomeOptions.map((x) => (
          <button
            key={x}
            className={outcome === x ? "selected" : ""}
            aria-pressed={outcome === x}
            onClick={() => setOutcome(x)}
          >
            {t(x)}
          </button>
        ))}
      </div>
      <div className="input-row">
        <label>
          {t("copy.lengde.970a8be")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
          <input
            aria-describedby={touched && !catchValid ? "past-catch-error" : undefined}
            aria-invalid={touched && !lengthNumber}
            inputMode="decimal"
            value={length}
            onChange={(e) => setLength(e.target.value)}
            placeholder="cm"
          />
        </label>
        <label>
          {t("copy.vekt.f6a2623")} <em>{t("copy.pakrevd.3ae3b8f")}</em>
          <input
            aria-describedby={touched && !catchValid ? "past-catch-error" : undefined}
            aria-invalid={touched && !weightNumber}
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="kg"
          />
        </label>
      </div>
      <ImageUploadField
        className="feedback-upload"
        description={t("copy.valgfritt.lagres.med.fangstrapporten.fe3d2fe")}
        error={imageError}
        imageName={imageName}
        selectImage={selectImage}
      />
      <label>
        {t("copy.kommentar.19c85a8")} <em>{t("copy.valgfritt.4a815de")}</em>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={300}
          placeholder={t("copy.observasjoner.om.fisken.eller.fangststedet.60f87d2")}
        />
      </label>
      <FormError
        id="past-catch-error"
        message={
          touched && !catchValid
            ? t("copy.fangsttid.ma.v.re.innenfor.turen.lengde.og.vekt..5790876")
            : undefined
        }
      />
      <button className="primary" onClick={() => addCatch(true)}>
        {t("copy.legg.til.og.kontroller.turen.3f05979")}
      </button>
      <button className="secondary" onClick={() => addCatch(false)}>
        {t("copy.lagre.og.legg.til.en.fangst.til.cf79651")}
      </button>
      <button className="text-button" onClick={() => setStep(1)}>
        {t("copy.tilbake.4fb8dc1")}
      </button>
    </>
  );
}
