"use client";

import { useState } from "react";
import { permitCatalogRepository } from "@/data/repositories/permit-catalog";
import type { ZoneId } from "@/domain/zones/zone";
import { useDocuments } from "@/features/documents/use-documents";
import { PermitCheckout } from "./permit-checkout";
import { PermitReportingRegistration } from "./permit-reporting-registration";
import { testPurchaseDocumentPrefix } from "./create-test-permit-document";
import { usePermitReportingDays } from "./use-permit-reporting-days";
import { usePermitPurchases } from "./use-permit-purchases";
import { permitReportingOutcomeLabels } from "@/domain/fishing-permits/permit-reporting-day";
import { canPurchasePrototypePermit } from "@/domain/fishing-permits/prototype-permit-product";

const zones: readonly ZoneId[] = [1, 2, 3, 4];

export function PermitShop({
  initialZone = 3,
  onPermitPurchased,
  onOpenPermits,
  onGoHome,
}: {
  initialZone?: ZoneId;
  onPermitPurchased?: (zoneId: ZoneId) => void;
  onOpenPermits?: () => void;
  onGoHome?: () => void;
}) {
  const [selectedZone, setSelectedZone] = useState<ZoneId>(initialZone);
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState("");
  const documents = useDocuments();
  const reportingDays = usePermitReportingDays();
  const purchases = usePermitPurchases();
  const zoneProducts = permitCatalogRepository.listProductsByZone(selectedZone);
  const areas = Array.from(new Set(zoneProducts.map((product) => product.areaName)));
  const products =
    selectedArea === "all"
      ? zoneProducts
      : zoneProducts.filter((product) => product.areaName === selectedArea);
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
    const purchaseResult = purchases.clear();
    if (!purchaseResult.ok) {
      setResetMessage(purchaseResult.error);
      return;
    }
    setResetMessage("Alle testkjøpte fiskekort er fjernet fra denne enheten.");
  }

  if (selectedProduct) {
    if (selectedProduct.action === "register-reporting-day")
      return (
        <PermitReportingRegistration
          product={selectedProduct}
          documents={documents.documents}
          back={() => setSelectedProductId(null)}
          save={reportingDays.save}
        />
      );
    return (
      <PermitCheckout
        product={selectedProduct}
        documents={documents.documents}
        back={() => setSelectedProductId(null)}
        save={documents.save}
        savePurchase={purchases.save}
        onPurchased={onPermitPurchased}
        onOpenPermits={onOpenPermits}
        onGoHome={onGoHome}
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
                setSelectedArea("all");
                setResetMessage("");
              }}
            >
              Sone {zoneId}
            </button>
          ))}
        </div>
      </fieldset>
      {areas.length > 1 && (
        <label className="permit-area-filter">
          Delsone eller salgsområde
          <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
            <option value="all">Vis alle i sone {selectedZone}</option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </label>
      )}
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
            {!canPurchasePrototypePermit(product) && (
              <span className="permit-shop-price-note">Pris må bekreftes hos selger.</span>
            )}
            <strong className="permit-availability available">
              Tilgjengelighet kontrolleres for valgt dato
            </strong>
            <p>{product.validity.label}</p>
            <p>{product.capacity.label}</p>
            <p>{product.note}</p>
            <div>
              <button
                className="primary"
                type="button"
                disabled={!canPurchasePrototypePermit(product)}
                onClick={() => setSelectedProductId(product.id)}
              >
                {product.action === "register-reporting-day"
                  ? "Velg rapporteringskort"
                  : canPurchasePrototypePermit(product)
                    ? "Velg fiskekort"
                    : "Kjøp ikke tilgjengelig"}
              </button>
              <a href={product.source.url} target="_blank" rel="noreferrer">
                Se produktinformasjon ↗
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
      {reportingDays.records.length > 0 && (
        <section className="permit-reporting-summary" aria-labelledby="reporting-days-title">
          <h3 id="reporting-days-title">Registrerte rapporteringsdøgn</h3>
          {reportingDays.records.map((record) => (
            <p key={record.id}>
              <b>{record.areaName}</b> · {record.fishingDate} ·{" "}
              {permitReportingOutcomeLabels[record.outcome]}
            </p>
          ))}
        </section>
      )}
      {reportingDays.error && <p role="alert">{reportingDays.error}</p>}
      <p className="permit-shop-disclaimer">
        Produktdata kontrollert 31.08.2026. Pris, kapasitet og tilgjengelighet må kontrolleres før
        et virkelig kjøp.
      </p>
    </section>
  );
}
