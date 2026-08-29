import { Icon } from "@/components/ui/icon";
import { catchOutcomeOptions, fishSpeciesOptions } from "@/domain/catches/catch";
import type { CatchReportController } from "@/features/catch-report/hooks/use-catch-report-controller";

export function CatchSelectionStep({ controller }: { controller: CatchReportController }) {
  const { result, species } = controller.state;
  const { setResult, setSpecies, setStep } = controller.actions;

  return (
    <>
      <small>STEG 1 AV 4 · FANGST</small>
      <h2>Hva fikk du?</h2>
      <label>Art</label>
      <div className="choice">
        {fishSpeciesOptions.map((option) => (
          <button
            key={option}
            aria-pressed={species === option}
            className={species === option ? "selected" : ""}
            onClick={() => setSpecies(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <label>Resultat</label>
      <div className="choice two">
        {catchOutcomeOptions.map((option) => (
          <button
            key={option}
            aria-pressed={result === option}
            className={result === option ? "selected" : ""}
            onClick={() => setResult(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="selection-recap">
        <Icon name="check" size={17} />
        <span>
          Valgt:{" "}
          <b>
            {species.toLowerCase()} · {result.toLowerCase()}
          </b>
        </span>
      </div>
      <button className="primary mobile-fixed-action" onClick={() => setStep(2)}>
        Neste · størrelse
      </button>
    </>
  );
}
