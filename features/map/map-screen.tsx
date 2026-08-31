"use client";

import { ScreenHeader } from "@/components/ui/screen-header";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { permitCatalogRepository } from "@/data/repositories/permit-catalog";
import type { ZoneId } from "@/domain/zones/zone";
import { formatPrototypePermitPrice } from "@/domain/fishing-permits/prototype-permit-product";
import { useUserLocation } from "@/features/map/hooks/use-user-location";

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
  const suggestedZoneId = fishingContentRepository.getSuggestedZoneId();
  const suggestedZoneName =
    fishingContentRepository.findZone(suggestedZoneId)?.name.split(" · ")[0] ??
    `Sone ${suggestedZoneId}`;
  const location = useUserLocation(() => setSelected(suggestedZoneId), suggestedZoneName);
  return (
    <div className="screen map-screen">
      <ScreenHeader title="Fiskesoner" eyebrow="MANDALSELVA · VEILEDENDE KART" />
      <div className="map-canvas">
        <svg className="river" viewBox="0 0 400 560" aria-hidden="true">
          <path
            className="map-land"
            d="M52 550L57 495 85 452 92 400 125 352 133 294 183 240 194 184 231 133 239 76 272 6 383 0 386 560Z"
          />
          <path
            className="river-tributary"
            d="M238 82L284 66M190 184L147 157M132 296L84 280M94 400L44 381"
          />
          <path
            className="river-base"
            d="M267 0C250 32 266 52 241 79C218 104 246 125 218 151C188 178 210 201 177 226C144 251 165 274 136 301C109 326 126 350 105 374C82 399 104 421 77 446C53 469 76 493 52 515C38 528 35 545 31 565"
          />
          <path
            className="river-water"
            d="M267 0C250 32 266 52 241 79C218 104 246 125 218 151C188 178 210 201 177 226C144 251 165 274 136 301C109 326 126 350 105 374C82 399 104 421 77 446C53 469 76 493 52 515C38 528 35 545 31 565"
          />
          <g className="zone-boundaries">
            <path d="M16 438H382" />
            <path d="M16 315H382" />
            <path d="M16 202H382" />
          </g>
          <g className="map-place-dots">
            <circle cx="30" cy="532" r="4" />
            <circle cx="73" cy="432" r="4" />
            <circle cx="101" cy="365" r="4" />
            <circle cx="128" cy="306" r="4" />
            <circle cx="174" cy="221" r="4" />
            <circle cx="220" cy="142" r="4" />
            <circle cx="254" cy="57" r="4" />
          </g>
          <g className="map-place-names">
            <text x="43" y="537">
              MANDAL
            </text>
            <text x="84" y="437">
              HOLUM
            </text>
            <text x="112" y="370">
              ØYSLEBØ
            </text>
            <text x="140" y="311">
              MARNARDAL
            </text>
            <text x="186" y="226">
              LAUDAL
            </text>
            <text x="232" y="147">
              MANFLÅ
            </text>
            <text x="266" y="62">
              BJELLAND
            </text>
          </g>
          <g className="map-zone-names">
            <text x="306" y="502">
              SONE 1
            </text>
            <text x="306" y="381">
              SONE 2
            </text>
            <text x="306" y="268">
              SONE 3
            </text>
            <text x="306" y="94">
              SONE 4
            </text>
          </g>
          <text className="no-fishing-label" x="223" y="190">
            FISKE FORBUDT
          </text>
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
          <span /> Valgt hovedsone <i /> Din posisjon
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
