"use client";

import { ScreenHeader } from "@/components/ui/screen-header";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { permitCatalogRepository } from "@/data/repositories/permit-catalog";
import type { ZoneId } from "@/domain/zones/zone";
import { formatPrototypePermitPrice } from "@/domain/fishing-permits/prototype-permit-product";
import { useUserLocation } from "@/features/map/hooks/use-user-location";
import { InteractiveMandalselvaMap } from "@/features/map/interactive-mandalselva-map";
import { useState } from "react";
import {
  findMandalselvaZoneAtPosition,
  type MapCoordinate,
} from "@/data/map/mandalselva-zone-boundaries";

const zones = fishingContentRepository.getZones();

export function MapScreen({
  selected,
  setSelected,
  onUseZone,
  onBuyPermit,
}: {
  selected: ZoneId;
  setSelected: (zone: ZoneId) => void;
  onUseZone: (zone: ZoneId) => void;
  onBuyPermit: () => void;
}) {
  const z = fishingContentRepository.findZone(selected) ?? zones[0];
  const permitProducts = permitCatalogRepository.listProductsByZone(z.id);
  const [userPosition, setUserPosition] = useState<MapCoordinate | null>(null);
  const location = useUserLocation((position) => {
    setUserPosition(position);
    const locatedZone = findMandalselvaZoneAtPosition(position);
    if (!locatedZone) return "Posisjon funnet utenfor de registrerte hovedsonene.";
    setSelected(locatedZone);
    return `Posisjon funnet · sone ${locatedZone}`;
  });
  return (
    <div className="screen map-screen">
      <ScreenHeader title="Fiskesoner" eyebrow="MANDALSELVA · VEILEDENDE KART" />
      <InteractiveMandalselvaMap
        zones={zones}
        selected={selected}
        setSelected={setSelected}
        userPosition={userPosition}
      />
      <div className="map-location-controls">
        <button className="secondary" onClick={location.locate} disabled={location.isLoading}>
          <Icon name="pin" /> {location.isLoading ? "Henter posisjon …" : "Vis min posisjon"}
        </button>
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
        <section className="map-permit-products" aria-labelledby="map-permit-products-title">
          <div className="map-permit-heading">
            <div>
              <small>PROTOTYPEUTVALG</small>
              <h3 id="map-permit-products-title">Fiskekort i sonen</h3>
            </div>
            <span>Kontrollert 01.09.2026</span>
          </div>
          <div className="map-permit-list">
            {permitProducts.map((product) => (
              <article key={product.id}>
                <div>
                  <small>{product.areaName}</small>
                  <h4>{product.title}</h4>
                </div>
                <b>{formatPrototypePermitPrice(product)}</b>
                <p>{product.validity.label}</p>
                <p>{product.capacity.label}</p>
                <p>{product.note}</p>
                <a href={product.source.url} target="_blank" rel="noreferrer">
                  Kontroller kilde
                </a>
              </article>
            ))}
          </div>
          <p className="map-permit-disclaimer">
            Produktdataene er et datert øyeblikksbilde. Tilgjengelighet og betaling simuleres i
            prototypen.
          </p>
          <button className="primary" onClick={onBuyPermit}>
            Se og velg fiskekort i sone {z.id}
          </button>
        </section>
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
