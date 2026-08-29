import { Icon } from "@/components/ui/icon";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { appContentRepository } from "@/data/repositories/app-content";
import { StatusEngineControl } from "@/features/status-engine/status-engine-control";

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
      <StatusEngineControl
        id="desktop-demo-status"
        scenarios={scenarios}
        selected={selected}
        selectStatus={selectStatus}
        startTest={startTest}
      />
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
