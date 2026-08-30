"use client";

import { useState } from "react";
import { permitCatalogRepository } from "@/data/repositories/permit-catalog";
import type { ZoneId } from "@/domain/zones/zone";

const zones: readonly ZoneId[] = [1, 2, 3, 4];

export function PermitShop({ initialZone = 3 }: { initialZone?: ZoneId }) {
  const [selectedZone, setSelectedZone] = useState<ZoneId>(initialZone);
  const [message, setMessage] = useState("");
  const products = permitCatalogRepository.listProductsByZone(selectedZone);

  return (
    <section className="permit-shop" aria-label="Fiskekortbutikk">
      <p>
        Utforsk fiskekort for Mandalselva. Dette er en kjøpsprototype med et datert
        produktøyeblikksbilde – betaling og reservasjon er ikke aktivert.
      </p>
      <fieldset>
        <legend>Velg hovedsone</legend>
        <div className="permit-shop-zones">
          {zones.map((zoneId) => (
            <button
              key={zoneId}
              type="button"
              aria-pressed={selectedZone === zoneId}
              onClick={() => {
                setSelectedZone(zoneId);
                setMessage("");
              }}
            >
              Sone {zoneId}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="permit-shop-list">
        {products.map((product) => (
          <article key={product.id}>
            <small>{product.areaName}</small>
            <h3>{product.title}</h3>
            <b>
              {product.price.amountNok === null
                ? "Pris ikke offentliggjort"
                : `${product.price.amountNok} kr`}
            </b>
            <p>{product.validity.label}</p>
            <p>{product.capacity.label}</p>
            <p>{product.note}</p>
            <div>
              <button
                className="primary"
                type="button"
                onClick={() =>
                  setMessage(
                    `${product.title} er valgt. Bestilling og betaling aktiveres i en senere prototype.`,
                  )
                }
              >
                {product.action === "purchase" ? "Velg fiskekort" : "Velg rapporteringskort"}
              </button>
              <a href={product.source.url} target="_blank" rel="noreferrer">
                Kontroller produktkilden ↗
              </a>
            </div>
          </article>
        ))}
      </div>
      {message && (
        <p className="permit-shop-message" role="status" aria-live="polite">
          {message}
        </p>
      )}
      <p className="permit-shop-disclaimer">
        Produktdata kontrollert 31.08.2026. Pris, kapasitet og tilgjengelighet må kontrolleres før
        et virkelig kjøp.
      </p>
    </section>
  );
}
