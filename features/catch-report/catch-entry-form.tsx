import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
import { fishSpeciesOptions, catchOutcomeOptions } from "@/domain/catches/catch";
import type { CatchReportController } from "./hooks/use-catch-report-controller";
import { ImageUploadField } from "@/components/ui/image-upload-field";
export function CatchEntryForm({ controller }: { controller: CatchReportController }) {
  const { language, t } = useLanguage();
  const s = controller.state;
  const a = controller.actions;
  return (
    <form
      className="catch-entry-form"
      onSubmit={(e) => {
        e.preventDefault();
        void a.submit();
      }}
    >
      <h2>{t("copy.registrer.fangst.7ecfe4d")}</h2>
      <fieldset disabled={s.isSubmitting}>
        <legend>{t("copy.art.308e17d")}</legend>
        <div className="choice">
          {fishSpeciesOptions.map((x) => (
            <button
              type="button"
              key={x}
              aria-pressed={s.species === x}
              className={s.species === x ? "selected" : ""}
              onClick={() => a.setSpecies(x)}
            >
              {t(x)}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset disabled={s.isSubmitting}>
        <legend>{selectLocalized(language, "Resultat", "Outcome")}</legend>
        <div className="choice two">
          {catchOutcomeOptions.map((x) => (
            <button
              type="button"
              key={x}
              aria-pressed={s.result === x}
              className={s.result === x ? "selected" : ""}
              onClick={() => a.setResult(x)}
            >
              {t(x)}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="input-row">
        <label>
          {selectLocalized(language, "Lengde (cm)", "Length (cm)")}
          <input
            inputMode="decimal"
            placeholder="cm"
            value={s.length}
            onChange={(e) => a.setLength(e.target.value)}
            required
          />
        </label>
        <label>
          {selectLocalized(language, "Vekt (kg)", "Weight (kg)")}
          <input
            inputMode="decimal"
            placeholder="kg"
            value={s.weight}
            onChange={(e) => a.setWeight(e.target.value)}
            required
          />
        </label>
      </div>
      {s.touched && !s.validation.detailsValid && (
        <p role="alert">{t("copy.fyll.inn.bade.lengde.og.vekt.med.tall.st.rre.enn.1fba9fe")}</p>
      )}
      {s.validation.detailsValid && (s.validation.blocked || s.validation.largeSalmon) && (
        <div className="rule-result warning" role="status">
          <div>
            <b>{t(s.validation.ruleTitle)}</b>
            <p>{t(s.validation.ruleText)}</p>
          </div>
        </div>
      )}
      {s.validation.detailsValid && s.validation.blocked && (
        <label className="violation-confirm">
          <input
            type="checkbox"
            checked={s.violationConfirmed}
            onChange={(e) => a.setViolationConfirmed(e.target.checked)}
          />
          <span>{t("catch.confirmAccuracy")}</span>
        </label>
      )}
      <details className="catch-extras">
        <summary>{selectLocalized(language, "Legg til mer", "Add more")}</summary>
        <ImageUploadField
          className="upload-box"
          description={t("copy.valgfritt.bilde.av.fangsten.6b11a41")}
          error={s.imageError}
          imageName={s.imageName}
          selectImage={a.selectImage}
        />
        <label>
          {t("copy.kommentar.19c85a8")}
          <textarea
            maxLength={300}
            value={s.comment}
            onChange={(e) => a.setComment(e.target.value)}
          />
        </label>
      </details>
      {s.submissionError && <p role="alert">{t(s.submissionError)}</p>}
      <button
        type="submit"
        className="primary"
        disabled={s.isSubmitting || (s.validation.blocked && !s.violationConfirmed)}
      >
        {t(
          s.isSubmitting
            ? "prototype.saving"
            : s.validation.blocked
              ? "prototype.saveActualCatch"
              : "prototype.saveCatch",
        )}
      </button>
    </form>
  );
}
