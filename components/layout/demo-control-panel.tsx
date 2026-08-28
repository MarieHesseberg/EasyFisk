import { Icon } from "@/components/ui/icon";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { appContentRepository } from "@/data/repositories/app-content";

export function DemoControlPanel({
  scenarios,
  selected,
  selectStatus,
  startTest,
}: {
  scenarios: readonly DemoScenario[];
  selected: DemoScenario;
  selectStatus: (status: DemoStatus) => void;
  startTest: () => void;
}) {
  const { demoFeatures } = appContentRepository.getContent();
  return (
    <aside className="prototype-note feature-panel">
      <span>DEMONSTRASJONSMODUS</span>
      <h2>Prøv statusmotoren</h2>
      <p className="demo-intro">
        Velg en situasjon. Valget påvirker statuskontrollen og hva brukeren kan gjøre videre.
      </p>
      <label className="demo-select-label" htmlFor="demo-status">
        Situasjon
      </label>
      <select
        id="demo-status"
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
      <div className={`demo-result ${selected.level}`}>
        <b>
          {selected.level === "blocked"
            ? "Blokkerer oppstart"
            : selected.level === "warning"
              ? "Krever vurdering"
              : "Oppstart tillatt"}
        </b>
        <span>{selected.detail}</span>
      </div>
      <button className="demo-start" onClick={startTest}>
        Test valgt situasjon
      </button>
      <div className="feature-divider" />
      <span>FUNKSJONER I PROTOTYPEN</span>
      <ul>
        {demoFeatures.map((feature) => (
          <li key={feature}>
            <Icon name="check" size={16} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <small>
        Prototypen bruker realistiske {activeFishingRules.metadata.seasonYear}-regler. Kart,
        persondata, forhold og statistikk er demonstrasjonsdata.
      </small>
    </aside>
  );
}
