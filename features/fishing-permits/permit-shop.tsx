"use client";

import { useState } from "react";
import { permitCatalogRepository } from "@/data/repositories/permit-catalog";
import type { ZoneId } from "@/domain/zones/zone";
import { useDocuments } from "@/features/documents/use-documents";
import { PermitCheckout } from "./permit-checkout";
import { testPurchaseDocumentPrefix } from "./create-test-permit-document";

const zones: readonly ZoneId[] = [1, 2, 3, 4];

export function PermitShop({ initialZone = 3 }: { initialZone?: ZoneId }) {
  const [selectedZone, setSelectedZone] = useState<ZoneId>(initialZone);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState("");
  const documents = useDocuments();
  const products = permitCatalogRepository.listProductsByZone(selectedZone);
  const selectedProduct = selectedProductId
    ? permitCatalogRepository.findProduct(selectedProductId)
    : undefined;
  const testPurchases = documents.documents.filter((document) =>
    document.id.startsWith(testPurchaseDocumentPrefix),
  );

  async function resetTestPurchases() {
    for (const document of testPurchases) {
      const result = await documents.remove(document.id);
      if (!result.ok) {
        setResetMessage(result.error);
        return;
      }
    }
    setResetMessage("Alle testkjøpte fiskekort er fjernet fra denne enheten.");
  }

  if (selectedProduct) {
    return (
      <PermitCheckout
        product={selectedProduct}
        back={() => setSelectedProductId(null)}
        save={documents.save}
      />
    );
  }

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
                setResetMessage("");
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
            <strong className={`permit-availability ${product.availability.status}`}>
              {product.availability.label}
            </strong>
            <p>{product.validity.label}</p>
            <p>{product.capacity.label}</p>
            <p>{product.note}</p>
            <div>
              <button
                className="primary"
                type="button"
                disabled={!["available", "low"].includes(product.availability.status)}
                onClick={() => setSelectedProductId(product.id)}
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
      {testPurchases.length > 0 && (
        <button className="secondary" type="button" onClick={() => void resetTestPurchases()}>
          Nullstill testkjøpte fiskekort ({testPurchases.length})
        </button>
      )}
      {resetMessage && (
        <p className="permit-shop-message" role="status" aria-live="polite">
          {resetMessage}
        </p>
      )}
      <p className="permit-shop-disclaimer">
        Produktdata kontrollert 31.08.2026. Pris, kapasitet og tilgjengelighet må kontrolleres før
        et virkelig kjøp.
      </p>
    </section>
  );
}
