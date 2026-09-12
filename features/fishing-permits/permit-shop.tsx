"use client";
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
import {
  canPurchasePrototypePermit,
  formatPrototypePermitPrice,
} from "@/domain/fishing-permits/prototype-permit-product";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";
import { PermitProductDetail } from "./permit-product-detail";
import { getPrototypePermitDateRange } from "@/domain/fishing-permits/get-prototype-permit-availability";
import { useLanguage } from "@/components/localization/language-provider";
const zones: readonly ZoneId[] = [1, 2, 3, 4];
const todayInNorway = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
export function PermitShop({
  initialZone = 3,
  onPermitPurchased,
  onOpenPermits,
  onGoHome,
  paymentOutcome = "approved",
  onRegisterFee,
  onRegisterDisinfection,
}: {
  initialZone?: ZoneId;
  onPermitPurchased?: (zoneId: ZoneId) => void;
  onOpenPermits?: () => void;
  onGoHome?: () => void;
  paymentOutcome?: PrototypePaymentOutcome;
  onRegisterFee?: () => void;
  onRegisterDisinfection?: () => void;
}) {
  const [selectedZone, setSelectedZone] = useState<ZoneId>(initialZone);
  const [selectedArea, setSelectedArea] = useState("all");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isProductActionOpen, setIsProductActionOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayInNorway);
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
        savePurchase={purchases.save}
        onPurchased={onPermitPurchased}
        onOpenPermits={onOpenPermits}
        onGoHome={onGoHome}
        paymentOutcome={paymentOutcome}
        initialSelectedDate={selectedDate}
        onRegisterFee={onRegisterFee}
        onRegisterDisinfection={onRegisterDisinfection}
      />
    );
  }
  return (
    <section className="permit-shop" aria-label={t("copy.fiskekortbutikk.14d464f")}>
      <p>{t("copy.utforsk.fiskekort.for.mandalselva.dette.er.en.kj.8614835")}</p>
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
      <div className="permit-shop-list">
        {products.map((product) => (
          <article key={product.id}>
            <small>{t(product.areaName)}</small>
            <h3>{t(product.title)}</h3>
            <b>{formatPrototypePermitPrice(product, language)}</b>
            {!canPurchasePrototypePermit(product) && (
              <span className="permit-shop-price-note">
                {t("permit.contactForPurchase", {
                  name: product.seller.contactName,
                  phone: product.seller.phone,
                })}
              </span>
            )}
            <strong className="permit-availability available">
              {t("copy.tilgjengelighet.kontrolleres.for.valgt.dato.cf8072d")}
            </strong>
            <p>{t(product.validity.label)}</p>
            <p>{t(product.capacity.label)}</p>
            <p>{t(product.note)}</p>
            <div>
              <button
                className="primary"
                type="button"
                onClick={() => {
                  const range = getPrototypePermitDateRange(product);
                  const today = todayInNorway();
                  setSelectedDate(
                    product.type === "season"
                      ? range.startsOn
                      : today < range.startsOn
                        ? range.startsOn
                        : today > range.endsOn
                          ? range.endsOn
                          : today,
                  );
                  setIsProductActionOpen(false);
                  setSelectedProductId(product.id);
                }}
              >
                {product.action === "register-reporting-day"
                  ? t("content.f04bf0163837")
                  : canPurchasePrototypePermit(product)
                    ? t("content.43d5c7677b35")
                    : t("content.4392dec2b09e")}
              </button>
              <a href={product.source.url} target="_blank" rel="noreferrer">
                {t("copy.se.produktinformasjon.a1a7572")}
              </a>
            </div>
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
