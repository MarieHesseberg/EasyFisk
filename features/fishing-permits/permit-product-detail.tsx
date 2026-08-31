import { canPurchasePrototypePermit } from "@/domain/fishing-permits/prototype-permit-product";
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
  const availability = getPrototypePermitAvailability(product, selectedDate);
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
        ‹ Tilbake til fiskekort
      </button>
      <small>PRODUKTINFORMASJON · KONTROLLERT {product.source.checkedAt}</small>
      <h2 id="permit-product-title">{product.title}</h2>
      <p className="permit-product-area">{product.areaName}</p>

      <div
        className="permit-product-map"
        role="img"
        aria-label={`Veiledende kartmarkering av sone ${product.zoneId}`}
      >
        <span>Mandalselva</span>
        {[4, 3, 2, 1].map((zoneId) => (
          <i key={zoneId} className={zoneId === product.zoneId ? "selected" : ""}>
            Sone {zoneId}
          </i>
        ))}
        <small>Veiledende sonekart · fysisk oppmerking gjelder</small>
      </div>

      {!canPurchasePrototypePermit(product) && product.action === "purchase" ? (
        <div className="permit-contact-only-notice">
          <b>Pris er ikke offentliggjort</b>
          <span>
            Dette kortet kan ikke kjøpes i EasyFisk-prototypen. Kontakt selger for pris,
            tilgjengelighet og kjøp.
          </span>
        </div>
      ) : product.type === "season" ? (
        <div className="permit-season-period">
          <b>Sesongkortets gyldighet</b>
          <span>
            {dateRange.startsOn.split("-").reverse().join(".")}–
            {dateRange.endsOn.split("-").reverse().join(".")}
          </span>
          <small>Datoene settes automatisk for hele sesongen.</small>
        </div>
      ) : product.action === "register-reporting-day" && !hasQualifyingSeasonPermit ? (
        <div className="permit-calendar-blocked" role="status">
          <b>Sesongkort må registreres først</b>
          <span>
            Datokalenderen åpnes når et gyldig sesongkort for {product.areaName} er funnet.
          </span>
        </div>
      ) : (
        <>
          <PermitSalesCalendar
            product={product}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <strong className={`permit-availability ${availability.status}`} aria-live="polite">
            {availability.label}
          </strong>
          <p className="permit-fishing-day-time">Fiskedøgnet: {product.validity.label}</p>
        </>
      )}

      <dl className="permit-product-facts">
        <div>
          <dt>Korttype</dt>
          <dd>{typeLabels[product.type]}</dd>
        </div>
        <div>
          <dt>Fiskedøgn og gyldighet</dt>
          <dd>{product.validity.label}</dd>
        </div>
        <div>
          <dt>Pris</dt>
          <dd>
            {product.price.amountNok === null
              ? "Pris må bekreftes hos selger"
              : `${product.price.amountNok} kr`}
          </dd>
        </div>
        <div>
          <dt>Fiskere, kort og stenger</dt>
          <dd>{product.capacity.label}</dd>
        </div>
        <div>
          <dt>Aldersregler</dt>
          <dd>{details.ageRule}</dd>
        </div>
      </dl>

      <section>
        <h3>Utstyr og fasiliteter</h3>
        <ul>
          {details.equipmentAndFacilities.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Krav før fiske</h3>
        <ul>
          {product.requirements.requiresNationalFishingFee && <li>Gyldig statlig fiskeravgift</li>}
          {product.requirements.requiresDisinfection && <li>Gyldig desinfiseringsbevis</li>}
          {product.requirements.requiresRuleAcceptance && <li>Fiskereglene må leses og godtas</li>}
          {product.requirements.requiresSeasonPermit && <li>Gyldig sesongkort for samme område</li>}
        </ul>
      </section>
      <section>
        <h3>Fangst og rapportering</h3>
        <p>{details.reportingRule}</p>
      </section>
      <p className="permit-product-note">{product.note}</p>
      <PermitSellerContact seller={product.seller} />
      <a
        className="permit-product-source"
        href={product.source.url}
        target="_blank"
        rel="noreferrer"
      >
        Se original produktkilde hos Inatur ↗
      </a>

      {(canPurchasePrototypePermit(product) || product.action === "register-reporting-day") && (
        <button
          className="primary"
          type="button"
          disabled={!canContinue}
          onClick={continueToProduct}
        >
          {product.action === "register-reporting-day"
            ? "Fortsett til døgnregistrering"
            : "Fortsett til kjøp"}
        </button>
      )}
    </section>
  );
}
