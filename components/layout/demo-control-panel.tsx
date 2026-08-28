import { Icon } from "@/components/ui/icon";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";

const features = [
  "Samlet kontroll av fiskekort, avgift, desinfisering og kvote",
  "Start/stopp av fiskeøkt med GPS-forslag til sone",
  "Fangstrapport i tre steg med automatisk tid og sone",
  "Nullfangst, fiskehistorikk og personlig kvoteregnskap",
  "Veiledende kart over de fire faktiske hovedsonene",
  "Regler tilpasset sesong, sone og fangst",
  "Varsler om temperatur, stengninger og rapporteringsfrist",
  "Eksempel på aggregert fangst- og innsatsstatistikk",
  "Kontrollkort for oppsyn, favorittsoner og tilbakemeldinger",
];

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
        {features.map((feature) => (
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
