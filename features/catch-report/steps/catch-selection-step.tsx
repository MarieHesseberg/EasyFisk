import { Icon } from "@/components/ui/icon";
import { catchOutcomeOptions, fishSpeciesOptions } from "@/domain/catches/catch";
import type { CatchReportController } from "@/features/catch-report/hooks/use-catch-report-controller";
import { useLanguage } from "@/components/localization/language-provider";

export function CatchSelectionStep({ controller }: { controller: CatchReportController }) {
  const { t } = useLanguage();
  const { result, species } = controller.state;
  const { setResult, setSpecies, setStep } = controller.actions;

  return (
    <>
      <small>{t("copy.steg.1.av.4.fangst.e168eda")}</small>
      <h2>{t("copy.hva.fikk.du.3d08098")}</h2>
      <label>{t("copy.art.308e17d")}</label>
      <div className="choice">
        {fishSpeciesOptions.map((option) => (
          <button
            key={option}
            aria-pressed={species === option}
            className={species === option ? "selected" : ""}
            onClick={() => setSpecies(option)}
          >
            {t(option)}
          </button>
        ))}
      </div>
      <label>{t("copy.resultat.c9f6c1d")}</label>
      <div className="choice two">
        {catchOutcomeOptions.map((option) => (
          <button
            key={option}
            aria-pressed={result === option}
            className={result === option ? "selected" : ""}
            onClick={() => setResult(option)}
          >
            {t(option)}
          </button>
        ))}
      </div>
      <div className="selection-recap">
        <Icon name="check" size={17} />
        <span>
          {t("copy.valgt.eccccc1")}{" "}
          <b>
            {t(species).toLowerCase()} · {t(result).toLowerCase()}
          </b>
        </span>
      </div>
      <button className="primary mobile-fixed-action" onClick={() => setStep(2)}>
        {t("copy.neste.st.rrelse.382f764")}
      </button>
    </>
  );
}
