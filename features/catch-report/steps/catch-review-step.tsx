import { Icon } from "@/components/ui/icon";
import type { CatchReportController } from "@/features/catch-report/hooks/use-catch-report-controller";
import { formatClock } from "@/lib/time";

export function CatchReviewStep({
  activeZone,
  caughtAt,
  controller,
}: {
  activeZone: string;
  caughtAt: number;
  controller: CatchReportController;
}) {
  const {
    comment,
    imageName,
    lengthNumber,
    result,
    species,
    validation,
    violationConfirmed,
    weightNumber,
  } = controller.state;
  const { setStep, setViolationConfirmed, submit } = controller.actions;
  const { blocked, largeSalmon, ruleText, ruleTitle } = validation;

  return (
    <>
      <small>STEG 3 AV 4 · REGELKONTROLL</small>
      <h2>{blocked ? "Avlivingen bryter størrelsesreglene" : "Rapporten er kontrollert"}</h2>
      <div
        className={"rule-result " + (blocked ? "blocked" : largeSalmon ? "warning" : "approved")}
      >
        <span>{blocked ? "!" : <Icon name="check" />}</span>
        <div>
          <b>{ruleTitle}</b>
          <p>{ruleText}</p>
        </div>
      </div>
      <div className="applied-rules">
        <b>Størrelsesregler som er kontrollert</b>
        <p>
          <span>Minstemål</span>
          <strong>Laks og sjøørret: 35 cm</strong>
        </p>
        <p>
          <span>Fra 1. august</span>
          <strong>Én laks opptil 90 cm</strong>
        </p>
        <p>
          <span>Øvrige avlivede laks</span>
          <strong>Under 65 cm</strong>
        </p>
        <small>Minstemålet er 35 cm. Regelversjon 01.08.2026 er brukt.</small>
      </div>
      <div className="report-summary">
        <p>
          <b>
            {species} · {result.toLowerCase()}
          </b>
          <small>
            {lengthNumber} cm · {weightNumber} kg
          </small>
        </p>
        <p>
          <b>{activeZone}</b>
          <small>Fangsttid {formatClock(caughtAt)} · økt og sone er lagt til automatisk</small>
        </p>
        {imageName && (
          <p>
            <b>Bilde vedlagt</b>
            <small>{imageName}</small>
          </p>
        )}
        {comment && (
          <p>
            <b>Kommentar</b>
            <small>{comment}</small>
          </p>
        )}
      </div>
      {blocked ? (
        <>
          <label className="violation-confirm">
            <input
              type="checkbox"
              checked={violationConfirmed}
              onChange={(event) => setViolationConfirmed(event.target.checked)}
            />
            <span>
              <b>Jeg forstår at avlivingen ikke var tillatt</b>
              <small>
                Opplysningene over er riktige, og rapporten skal vise det som faktisk skjedde.
              </small>
            </span>
          </label>
          <button className="primary danger-submit" disabled={!violationConfirmed} onClick={submit}>
            Send inn faktisk fangst
          </button>
        </>
      ) : (
        <button className="primary" onClick={submit}>
          Send fangstrapport
        </button>
      )}
      <button className="secondary" onClick={() => setStep(2)}>
        Tilbake og endre
      </button>
    </>
  );
}
