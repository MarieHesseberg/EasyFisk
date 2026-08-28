"use client";

import { ScreenHeader } from "@/components/ui/screen-header";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import type { ZoneId } from "@/domain/zones/zone";
import { useUserLocation } from "@/features/map/hooks/use-user-location";

const zones = fishingContentRepository.getZones();

export function MapScreen({
  selected,
  setSelected,
  onUseZone,
}: {
  selected: ZoneId;
  setSelected: (zone: ZoneId) => void;
  onUseZone: (zone: ZoneId) => void;
}) {
  const z = zones[selected - 1];
  const location = useUserLocation(() => setSelected(3));
  return (
    <div className="screen map-screen">
      <ScreenHeader title="Fiskesoner" eyebrow="MANDALSELVA · VEILEDENDE KART" />
      <div className="map-canvas">
        <div className="map-label a">Mandal / Vik</div>
        <div className="map-label b">Øyslebø</div>
        <div className="map-label c">Laudal / Bjelland</div>
        <svg className="river" viewBox="0 0 400 500">
          <path d="M330-10C250 60 320 100 215 150S270 220 164 275 195 350 83 420C40 447 50 485 20 520" />
          <path
            className="glow"
            d="M330-10C250 60 320 100 215 150S270 220 164 275 195 350 83 420C40 447 50 485 20 520"
          />
        </svg>
        {zones.map((x, i) => (
          <button
            aria-label={"Vis " + x.name}
            aria-pressed={selected === x.id}
            key={x.id}
            onClick={() => setSelected(x.id)}
            className={"zone-pin z" + (i + 1) + (selected === x.id ? " selected" : "")}
          >
            <span>{x.id}</span>
          </button>
        ))}
        <button
          className="locate"
          aria-label="Finn min posisjon"
          onClick={location.locate}
          disabled={location.isLoading}
        >
          <Icon name="pin" />
        </button>
        <div className="map-legend">
          <span /> Hovedsone <i /> Din posisjon
        </div>
        {location.message && (
          <div className="map-location-status" role="status">
            {location.message}
          </div>
        )}
      </div>
      <article className="zone-sheet">
        <div className="sheet-handle" />
        <div className="zone-title">
          <span style={{ background: z.color }}>{z.id}</span>
          <div>
            <small>{z.status.toUpperCase()}</small>
            <h2>{z.name}</h2>
          </div>
        </div>
        <p className="zone-desc">{z.desc}</p>
        <div className="zone-facts">
          <div>
            <small>SESONG {activeFishingRules.metadata.seasonYear}</small>
            <b>{z.season}</b>
          </div>
          <div>
            <small>OMFANG</small>
            <b>{z.note}</b>
          </div>
        </div>
        <p className="zone-note">
          <Icon name="book" size={19} /> Kartet er veiledende. Fysisk oppmerking og lokale regler
          gjelder alltid.
        </p>
        <button className="primary" onClick={() => onUseZone(z.id)}>
          Bruk sone {z.id} i fiskeøkten
        </button>
      </article>
    </div>
  );
}
