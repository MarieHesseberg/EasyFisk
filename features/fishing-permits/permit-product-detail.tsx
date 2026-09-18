import { usePermitPurchases } from "./use-permit-purchases";
import { selectLocalized } from "@/locales";
import {
  canPurchasePrototypePermit,
  formatPrototypePermitPrice,
} from "@/domain/fishing-permits/prototype-permit-product";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import {
  canSelectPrototypePermit,
  getPrototypePermitAvailability,
  getPrototypePermitDateRange,
} from "@/domain/fishing-permits/get-prototype-permit-availability";
import { getPrototypePermitProductDetails } from "@/data/prototype/mandalselva-permit-product-details";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { findQualifyingSeasonPermitForProduct } from "@/domain/fishing-permits/permit-reporting-day";
import { PermitSalesCalendar } from "./permit-sales-calendar";
import { PermitSellerContact } from "./permit-seller-contact";
import { useLanguage } from "@/components/localization/language-provider";
const typeLabels = {
  day: "Døgnkort",
  week: "Ukekort",
  season: "Sesongkort",
  boat: "Båtkort",
  group: "Gruppekort",
  reporting: "Rapporteringskort",
} as const;
export function PermitProductDetail({
  product,
  selectedDate,
  setSelectedDate,
  back,
  continueToProduct,
  documents,
}: {
  product: PrototypePermitProduct;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  back: () => void;
  continueToProduct: () => void;
  documents: FishingDocument[];
}) {
  const { language, t } = useLanguage();
  const { purchases } = usePermitPurchases();
  const availability = getPrototypePermitAvailability(
    product,
    selectedDate,
    language,
    undefined,
    purchases,
  );
  const dateRange = getPrototypePermitDateRange(product);
  const details = getPrototypePermitProductDetails(product);
  const hasQualifyingSeasonPermit =
    product.action !== "register-reporting-day" ||
    Boolean(findQualifyingSeasonPermitForProduct(documents, product));
  const canContinue =
    (product.action === "register-reporting-day" && hasQualifyingSeasonPermit) ||
    (product.action === "purchase" &&
      canPurchasePrototypePermit(product) &&
      canSelectPrototypePermit(availability));
  return (
    <section className="permit-product-detail" aria-labelledby="permit-product-title">
      <button className="back" type="button" onClick={back}>
        ‹ {selectLocalized(language, "Tilbake til fiskekort", "Back to permits")}
      </button>
      <h2 id="permit-product-title">{t(product.title)}</h2>
      <p className="permit-product-area">{t(product.areaName)}</p>

      <strong className="permit-product-price">
        {formatPrototypePermitPrice(product, language)}
      </strong>
      <p>
        {selectLocalized(language, "Sone", "Zone")} {product.zoneId} · {t(product.capacity.label)}
      </p>

      {!canPurchasePrototypePermit(product) && product.action === "purchase" ? (
        <div className="permit-contact-only-notice">
          <b>{t("copy.kj.p.via.selger.7d798ff")}</b>
          <span>{t("copy.dette.kortet.kan.ikke.kj.pes.i.easyfisk.prototyp.c0afee1")}</span>
        </div>
      ) : product.type === "season" ? (
        <div className="permit-season-period">
          <b>{t("copy.sesongkortets.gyldighet.8ef20e1")}</b>
          <span>
            {dateRange.startsOn.split("-").reverse().join(".")}–
            {dateRange.endsOn.split("-").reverse().join(".")}
          </span>
          <small>{t("copy.datoene.settes.automatisk.for.hele.sesongen.b2a2fd4")}</small>
        </div>
      ) : product.action === "register-reporting-day" && !hasQualifyingSeasonPermit ? (
        <div className="permit-calendar-blocked" role="status">
          <b>{t("copy.sesongkort.ma.registreres.f.rst.7749e94")}</b>
          <span>{t("permit.seasonRequired", { area: t(product.areaName) })}</span>
        </div>
      ) : (
        <>
          <PermitSalesCalendar
            product={product}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <strong className={`permit-availability ${availability.status}`} aria-live="polite">
            {t(availability.label)}
          </strong>
          <p className="permit-fishing-day-time">
            {selectLocalized(language, "Fiskedøgnet", "Fishing day")}: {t(product.validity.label)}
          </p>
        </>
      )}

      {(canPurchasePrototypePermit(product) || product.action === "register-reporting-day") && (
        <button
          className="primary"
          type="button"
          disabled={!canContinue}
          onClick={continueToProduct}
        >
          {product.action === "register-reporting-day"
            ? t("content.2c819362c354")
            : t("content.13a2aa100b4d")}
        </button>
      )}
      <details className="permit-product-more">
        <summary>
          {selectLocalized(
            language,
            "Vilkår og produktinformasjon",
            "Terms and product information",
          )}
        </summary>
        <dl className="permit-product-facts">
          <div>
            <dt>{t("copy.korttype.599665c")}</dt>
            <dd>{t(typeLabels[product.type])}</dd>
          </div>
          <div>
            <dt>{t("copy.fisked.gn.og.gyldighet.d9b66e0")}</dt>
            <dd>{t(product.validity.label)}</dd>
          </div>
          <div>
            <dt>{t("copy.pris.b97114e")}</dt>
            <dd>{formatPrototypePermitPrice(product, language)}</dd>
          </div>
        </dl>

        <section>
          <h3>{t("copy.utstyr.og.fasiliteter.3d58dcc")}</h3>
          <ul>
            {details.equipmentAndFacilities.map((detail) => (
              <li key={detail}>{t(detail)}</li>
            ))}
          </ul>
        </section>
        <section>
          <h3>{t("copy.krav.f.r.fiske.a190cd4")}</h3>
          <ul>
            {product.requirements.requiresNationalFishingFee && (
              <li>{t("copy.gyldig.statlig.fiskeravgift.a9319d6")}</li>
            )}
            {product.requirements.requiresDisinfection && (
              <li>{t("copy.gyldig.desinfiseringsbevis.1dc1fdc")}</li>
            )}
            {product.requirements.requiresRuleAcceptance && (
              <li>{t("copy.fiskereglene.ma.leses.og.godtas.06b181f")}</li>
            )}
            {product.requirements.requiresSeasonPermit && (
              <li>{t("copy.gyldig.sesongkort.for.samme.omrade.1aa3171")}</li>
            )}
          </ul>
        </section>
        <section>
          <h3>{t("copy.fangst.og.rapportering.f07042e")}</h3>
          <p>{t(details.reportingRule)}</p>
        </section>
        {t(product.note) && <p className="permit-product-note">{t(product.note)}</p>}
      </details>
      <PermitSellerContact seller={product.seller} />
      <a
        className="permit-product-source"
        href={product.source.url}
        target="_blank"
        rel="noreferrer"
      >
        {t("copy.se.original.produktkilde.hos.inatur.4b67735")}
      </a>
    </section>
  );
}
