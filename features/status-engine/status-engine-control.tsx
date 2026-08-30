import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";

export function StatusEngineControl({
  id,
  scenarios,
  selected,
  isTestMode,
  selectStatus,
  startTest,
  useActualStatus,
}: {
  id: string;
  scenarios: readonly DemoScenario[];
  selected: DemoScenario;
  isTestMode: boolean;
  selectStatus: (status: DemoStatus) => void;
  startTest: () => void;
  useActualStatus: () => void;
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
    </>
  );
}

function getStatusResult(scenario: DemoScenario) {
  if (scenario.level === "blocked") return "Blokkerer oppstart";
  if (scenario.level === "warning") return "Krever vurdering";
  return "Oppstart tillatt";
}
