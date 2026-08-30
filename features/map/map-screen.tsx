"use client";

import { ScreenHeader } from "@/components/ui/screen-header";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { permitCatalogRepository } from "@/data/repositories/permit-catalog";
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
  const z = fishingContentRepository.findZone(selected) ?? zones[0];
  const permitProducts = permitCatalogRepository.listProductsByZone(z.id);
  const suggestedZoneId = fishingContentRepository.getSuggestedZoneId();
  const suggestedZoneName =
    fishingContentRepository.findZone(suggestedZoneId)?.name.split(" · ")[0] ??
    `Sone ${suggestedZoneId}`;
  const location = useUserLocation(() => setSelected(suggestedZoneId), suggestedZoneName);
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
        <section className="map-permit-products" aria-labelledby="map-permit-products-title">
          <div className="map-permit-heading">
            <div>
              <small>PROTOTYPEUTVALG</small>
              <h3 id="map-permit-products-title">Fiskekort i sonen</h3>
            </div>
            <span>Kontrollert 31.08.2026</span>
          </div>
          <div className="map-permit-list">
            {permitProducts.map((product) => (
              <article key={product.id}>
                <div>
                  <small>{product.areaName}</small>
                  <h4>{product.title}</h4>
                </div>
                <b>
                  {product.price.amountNok === null
                    ? "Pris ikke oppgitt"
                    : `${product.price.amountNok} kr`}
                </b>
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
            Produktdataene er et datert øyeblikksbilde. Tilgjengelighet og kjøp er ikke aktive i
            prototypen.
          </p>
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
