import { FlowTitle } from "@/components/ui/flow-title";
import { Icon } from "@/components/ui/icon";
import { zones } from "@/data/mock/fishing-data";
import type { DemoStatus } from "@/domain/models";

export function ZoneStep({
  demoStatus,
  next,
  selectedZone,
  selectZone,
}: {
  demoStatus: DemoStatus;
  next: () => void;
  selectedZone: number;
  selectZone: (zone: number) => void;
}) {
  const nearBorder = demoStatus === "zoneBorder";

  return (
    <>
      <FlowTitle
        icon="map"
        eyebrow="SONEFORSLAG"
        title={nearBorder ? "Du er nær en sonegrense" : "Vi fant Sone 3"}
        text={
          nearBorder
            ? "GPS-posisjonen kan ligge i Sone 2 eller Sone 3. Velg sonen som stemmer med fysisk skilting."
            : "Posisjonen din ser ut til å være i Sone 3 mellom Øyslebø og Laudal."
        }
      />
      {nearBorder && (
        <div className="scenario-banner warning">
          <b>GPS-treffet er usikkert</b>
          <span>Ca. 18 meter fra registrert sonegrense</span>
        </div>
      )}
      <div className="zone-confirm">
        <div className={"mini-map " + (nearBorder ? "border-hit" : "")}>
          <span>{nearBorder ? "NÆR SONEGRENSE" : "DIN POSISJON"}</span>
          <i />
        </div>
        <label htmlFor="session-zone">Hovedsone</label>
        <select
          id="session-zone"
          value={selectedZone}
          onChange={(event) => selectZone(Number(event.target.value))}
        >
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.name}
            </option>
          ))}
        </select>
        {selectedZone === 2 && (
          <>
            <label htmlFor="session-subzone">Delsone</label>
            <select id="session-subzone">
              <option>Fuskeland B</option>
              <option>Hauge</option>
              <option>Holmesland</option>
              <option>Nøding</option>
            </select>
          </>
        )}
      </div>
      <p className="auto-note">
        <Icon name="book" size={17} /> Kontroller fysisk skilting dersom du står nær en grense.
      </p>
      <button className="primary" onClick={next}>
        Bekreft sone og se regler
      </button>
    </>
  );
}
