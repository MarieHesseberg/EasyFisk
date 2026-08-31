import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";

export function StatusEngineControl({
  id,
  scenarios,
  selected,
  isTestMode,
  selectStatus,
  startTest,
  useActualStatus,
  paymentOutcome,
  setPaymentOutcome,
}: {
  id: string;
  scenarios: readonly DemoScenario[];
  selected: DemoScenario;
  isTestMode: boolean;
  selectStatus: (status: DemoStatus) => void;
  startTest: () => void;
  useActualStatus: () => void;
  paymentOutcome: PrototypePaymentOutcome;
  setPaymentOutcome: (outcome: PrototypePaymentOutcome) => void;
}) {
  return (
    <>
      <label className="demo-select-label" htmlFor={id}>
        Situasjon
      </label>
      <select
        id={id}
        className="demo-select"
        value={selected.id}
        onChange={(event) => selectStatus(event.target.value as DemoStatus)}
      >
        {scenarios.map((scenario) => (
          <option value={scenario.id} key={scenario.id}>
            {scenario.label}
          </option>
        ))}
      </select>
      <div className={`demo-result ${selected.level}`} role="status" aria-live="polite">
        <small>{isTestMode ? "TESTMODUS ER AKTIV" : "NORMALMODUS ER AKTIV"}</small>
        <b>{getStatusResult(selected)}</b>
        <span>{selected.detail}</span>
      </div>
      <button className="demo-start" onClick={startTest}>
        {isTestMode ? "Bruk valgt testsituasjon" : "Aktiver og test valgt situasjon"}
      </button>
      {isTestMode && (
        <button className="secondary" onClick={useActualStatus}>
          Avslutt testmodus · bruk registrerte dokumenter
        </button>
      )}
      <div className="feature-divider" />
      <label className="demo-select-label" htmlFor={`${id}-payment`}>
        Resultat ved neste testbetaling
      </label>
      <select
        id={`${id}-payment`}
        className="demo-select"
        value={paymentOutcome}
        onChange={(event) => setPaymentOutcome(event.target.value as PrototypePaymentOutcome)}
      >
        <option value="approved">Betaling godkjennes</option>
        <option value="cancelled">Betaling avbrytes</option>
        <option value="failed">Betaling feiler</option>
      </select>
      <small>Dette er en intern prototypeinnstilling og vises ikke i kjøpsskjemaet.</small>
    </>
  );
}

function getStatusResult(scenario: DemoScenario) {
  if (scenario.level === "blocked") return "Blokkerer oppstart";
  if (scenario.level === "warning") return "Krever vurdering";
  return "Oppstart tillatt";
}
