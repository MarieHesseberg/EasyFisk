"use client";
import { usePermitJourney } from "./use-permit-journey";
import { selectLocalized } from "@/locales";
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
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";
import { PermitProductDetail } from "./permit-product-detail";
import { useLanguage } from "@/components/localization/language-provider";
const zones: readonly ZoneId[] = [1, 2, 3, 4];
import { type PermitJourneyProps, type PermitJourney } from "./permit-journey";
export function PermitShop({
  journey,
  setJourney,
  onZoneChange,
  initialZone = 3,
  onPermitPurchased,
  onOpenPermits,
  onGoHome,
  paymentOutcome = "approved",
  onRegisterFee,
  onRegisterDisinfection,
}: PermitJourneyProps & {
  initialZone?: ZoneId;
  onPermitPurchased?: (zoneId: ZoneId) => void;
  onOpenPermits?: () => void;
  onGoHome?: () => void;
  paymentOutcome?: PrototypePaymentOutcome;
  onRegisterFee?: () => void;
  onRegisterDisinfection?: () => void;
}) {
  const [localJourney, setLocalJourney] = usePermitJourney(initialZone, !journey);
  const current = journey ?? localJourney;
  const update = setJourney ?? setLocalJourney;
  const { selectedZone, selectedArea, selectedProductId, isProductActionOpen, selectedDate } =
    current;
  function change<Key extends keyof PermitJourney>(key: Key, value: PermitJourney[Key]) {
    update((previous) => ({ ...previous, [key]: value }));
  }
  const setSelectedDate = (date: string) => change("selectedDate", date);
  const setSelectedProductId = (id: string | null) => change("selectedProductId", id);
  const setIsProductActionOpen = (open: boolean) => change("isProductActionOpen", open);
  const setSelectedArea = (area: string) => change("selectedArea", area);
  const setSelectedZone = (zone: ZoneId) => {
    change("selectedZone", zone);
    onZoneChange?.(zone);
  };
  const [resetMessage, setResetMessage] = useState("");
  const { language, t } = useLanguage();
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
    setResetMessage(t("permit.testPurchasesRemoved"));
  }
  if (selectedProduct) {
    if (!isProductActionOpen)
      return (
        <PermitProductDetail
          product={selectedProduct}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          back={() => setSelectedProductId(null)}
          continueToProduct={() => setIsProductActionOpen(true)}
          documents={documents.documents}
        />
      );
    if (selectedProduct.action === "register-reporting-day")
      return (
        <PermitReportingRegistration
          initialSelectedDate={selectedDate}
          onDateChange={setSelectedDate}
          initialOutcome={current.reportingDrafts[selectedProduct.id]}
          onOutcomeChange={(outcome) =>
            update((previous) => ({
              ...previous,
              reportingDrafts: { ...previous.reportingDrafts, [selectedProduct.id]: outcome },
            }))
          }
          product={selectedProduct}
          documents={documents.documents}
          back={() => setIsProductActionOpen(false)}
          save={reportingDays.save}
        />
      );
    return (
      <PermitCheckout
        product={selectedProduct}
        documents={documents.documents}
        back={() => setIsProductActionOpen(false)}
        save={documents.save}
        saveMany={documents.saveMany}
        savePurchase={purchases.save}
        onPurchased={onPermitPurchased}
        onOpenPermits={onOpenPermits}
        onGoHome={() => {
          setSelectedProductId(null);
          setIsProductActionOpen(false);
          onGoHome?.();
        }}
        paymentOutcome={paymentOutcome}
        initialSelectedDate={selectedDate}
        initialForm={current.drafts[selectedProduct.id]}
        initialReceipt={current.receipts[`${selectedProduct.id}:${selectedDate}`]}
        onFormChange={(form) =>
          update((previous) => ({
            ...previous,
            drafts: { ...previous.drafts, [selectedProduct.id]: form },
          }))
        }
        onReceipt={(receipt) =>
          update((previous) => ({
            ...previous,
            drafts: Object.fromEntries(
              Object.entries(previous.drafts).filter(([id]) => id !== selectedProduct.id),
            ),
            receipts: { ...previous.receipts, [`${selectedProduct.id}:${selectedDate}`]: receipt },
          }))
        }
        onRegisterFee={onRegisterFee}
        onRegisterDisinfection={onRegisterDisinfection}
      />
    );
  }
  return (
    <section className="permit-shop" aria-label={t("copy.fiskekortbutikk.14d464f")}>
      <fieldset>
        <legend>{t("copy.velg.hovedsone.05c8f59")}</legend>
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
              {selectLocalized(language, "Sone", "Zone")} {zoneId}
            </button>
          ))}
        </div>
      </fieldset>
      {areas.length > 1 && (
        <label className="permit-area-filter">
          {t("copy.delsone.eller.salgsomrade.7d5c937")}
          <select value={selectedArea} onChange={(event) => setSelectedArea(event.target.value)}>
            <option value="all">
              {t("copy.vis.alle.i.sone.ee3b086")}
              {selectedZone}
            </option>
            {areas.map((area) => (
              <option key={area} value={area}>
                {t(area)}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="permit-area-filter">
        {t("copy.dato.aaf5660")}
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            if (event.target.value) setSelectedDate(event.target.value);
          }}
        />
      </label>
      <div className="permit-shop-list">
        {products.map((product) => (
          <article key={product.id} className="permit-product-card">
            <h3 id={`permit-title-${product.id}`}>{t(product.title)}</h3>
            <b>
              {product.price.amountNok === null
                ? t("permit.priceUnavailable")
                : `${new Intl.NumberFormat(language === "no" ? "nb-NO" : "en-GB").format(product.price.amountNok)} kr`}
            </b>
            <button
              className="primary permit-product-card-open"
              type="button"
              aria-describedby={`permit-title-${product.id}`}
              onClick={() => {
                update((previous) => ({
                  ...previous,
                  isProductActionOpen: false,
                  selectedProductId: product.id,
                  receipts: Object.fromEntries(
                    Object.entries(previous.receipts).filter(
                      ([key]) => !key.startsWith(`${product.id}:`),
                    ),
                  ),
                }));
              }}
            >
              {product.action === "register-reporting-day"
                ? t("content.f04bf0163837")
                : canPurchasePrototypePermit(product)
                  ? t("copy.kj.p.fiskekort.d32ea04")
                  : t("content.4392dec2b09e")}
            </button>
          </article>
        ))}
      </div>
      {testPurchases.length > 0 && (
        <button className="secondary" type="button" onClick={() => void resetTestPurchases()}>
          {t("copy.nullstill.testkj.pte.fiskekort.ce276cb")}
          {testPurchases.length})
        </button>
      )}
      {resetMessage && (
        <p className="permit-shop-message" role="status" aria-live="polite">
          {resetMessage}
        </p>
      )}
      {reportingDays.records.length > 0 && (
        <section className="permit-reporting-summary" aria-labelledby="reporting-days-title">
          <h3 id="reporting-days-title">{t("copy.registrerte.rapporteringsd.gn.8341681")}</h3>
          {reportingDays.records.map((record) => (
            <p key={record.id}>
              <b>{t(record.areaName)}</b> · {record.fishingDate} ·{" "}
              {t(permitReportingOutcomeLabels[record.outcome])}
            </p>
          ))}
        </section>
      )}
      {reportingDays.error && <p role="alert">{t(reportingDays.error)}</p>}
      <p className="permit-shop-disclaimer">
        {t("copy.produktdata.kontrollert.01.09.2026.pris.kapasite.206cb48")}
      </p>
    </section>
  );
}
