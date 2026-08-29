import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";

export function StatusEngineControl({
  id,
  scenarios,
  selected,
  selectStatus,
  startTest,
}: {
  id: string;
  scenarios: readonly DemoScenario[];
  selected: DemoScenario;
  selectStatus: (status: DemoStatus) => void;
  startTest: () => void;
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
        <b>{getStatusResult(selected)}</b>
        <span>{selected.detail}</span>
      </div>
      <button className="demo-start" onClick={startTest}>
        Test valgt situasjon
      </button>
    </>
  );
}

function getStatusResult(scenario: DemoScenario) {
  if (scenario.level === "blocked") return "Blokkerer oppstart";
  if (scenario.level === "warning") return "Krever vurdering";
  return "Oppstart tillatt";
}
