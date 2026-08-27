import { FlowTitle } from "@/components/ui/flow-title";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import type { DemoStatus } from "@/domain/fishing-rules/rule";
import type { ZoneId } from "@/domain/zones/zone";

const zones = fishingContentRepository.getZones();

export function ZoneStep({
  back,
  demoStatus,
  next,
  selectedZone,
  selectZone,
}: {
  back: () => void;
  demoStatus: DemoStatus;
  next: () => void;
  selectedZone: ZoneId;
  selectZone: (zone: ZoneId) => void;
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
          onChange={(event) => selectZone(Number(event.target.value) as ZoneId)}
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
      <button className="text-button" onClick={back}>
        Tilbake
      </button>
    </>
  );
}
