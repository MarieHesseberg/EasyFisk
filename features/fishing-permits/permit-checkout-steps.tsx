import { selectLocalized } from "@/locales";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { calculatePermitValidity } from "@/domain/fishing-permits/calculate-permit-validity";
import type { PermitCheckoutForm } from "@/domain/fishing-permits/permit-purchase";
import { getPermitPriceSummary } from "@/domain/fishing-permits/permit-purchase";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import type { PermitPurchase } from "@/domain/fishing-permits/permit-purchase";
import type { PrototypePermitAvailability } from "@/domain/fishing-permits/prototype-permit-product";
import { useLanguage } from "@/components/localization/language-provider";
type UpdateForm = <Key extends keyof PermitCheckoutForm>(
  key: Key,
  value: PermitCheckoutForm[Key],
) => void;
export function PermitBuyerStep({
  selectedDate,
  form,
  updateForm,
  availability,
  next,
}: {
  selectedDate: string;
  form: PermitCheckoutForm;
  updateForm: UpdateForm;
  availability: PrototypePermitAvailability;
  next: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="permit-checkout-step">
      <h3>{t("copy.fiskedato.og.kortinnehaver.74acf27")}</h3>
      <p>{t("copy.kortet.utstedes.til.personen.som.skal.v.re.ansva.40aeadd")}</p>
      <div className="permit-checkout-date-summary">
        <b>{t("copy.valgt.fiskedato.cee5357")}</b>
        <span>{selectedDate.split("-").reverse().join(".")}</span>
        <small>{t("copy.datoen.kan.endres.pa.produktsiden.5b5d923")}</small>
      </div>
      <div
        className={`permit-availability ${availability.status}`}
        role={["available", "low"].includes(availability.status) ? "status" : "alert"}
        aria-live="polite"
      >
        {t(availability.label)}
      </div>
      <label>
        {t("copy.fullt.navn.f714eec")}
        <input
          autoComplete="name"
          value={form.fullName}
          onChange={(event) => updateForm("fullName", event.target.value)}
        />
      </label>
      <label>
        {t("copy.f.dselsdato.c71a920")}
        <input
          type="date"
          autoComplete="bday"
          value={form.birthDate}
          onChange={(event) => updateForm("birthDate", event.target.value)}
        />
      </label>
      <label>
        {t("copy.e.post.b3418c9")}
        <input
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => updateForm("email", event.target.value)}
        />
      </label>
      <label>
        {t("copy.telefon.40314f8")}
        <input
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(event) => updateForm("phone", event.target.value)}
        />
      </label>
      <button
        className="primary"
        type="button"
        disabled={!["available", "low"].includes(availability.status)}
        onClick={next}
      >
        {t("copy.neste.krav.og.deltakere.39ad70a")}
      </button>
    </div>
  );
}
export function PermitRequirementsStep({
  product,
  form,
  updateForm,
  readiness,
  back,
  next,
}: {
  product: PrototypePermitProduct;
  form: PermitCheckoutForm;
  updateForm: UpdateForm;
  readiness: {
    fee: boolean;
    disinfection: boolean;
  };
  back: () => void;
  next: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="permit-checkout-step">
      <h3>{t("copy.deltakere.og.fiskekrav.6b0838d")}</h3>
      {product.type === "group" && (
        <label>
          {t("copy.medfiskere.ett.fullt.navn.per.linje.b8f9c1f")}
          <textarea
            rows={4}
            value={form.coFishersText}
            onChange={(event) => updateForm("coFishersText", event.target.value)}
          />
        </label>
      )}
      <div
        className="permit-requirement-status"
        aria-label={t("copy.dokumentstatus.ved.fiskedato.71094f9")}
      >
        <b>{t("copy.dokumenter.kontrolleres.igjen.nar.fisket.starter.05296bd")}</b>
        {product.requirements.requiresNationalFishingFee && (
          <span>
            {t(
              readiness.fee
                ? "✓ Fiskeravgift registrert"
                : "! Fiskeravgift mangler eller er utløpt",
            )}
          </span>
        )}
        {product.requirements.requiresDisinfection && (
          <span>
            {readiness.disinfection
              ? t("copy.desinfisering.registrert.84485d1")
              : t("copy.desinfisering.mangler.eller.er.utl.pt.a8e1e5d")}
          </span>
        )}
      </div>
      {(!readiness.fee || !readiness.disinfection) && (
        <p className="permit-purchase-requirement-note">
          {t("copy.du.kan.kj.pe.kortet.na.men.kan.ikke.starte.fiske.95066be")}
        </p>
      )}
      <label className="permit-consent">
        <input
          type="checkbox"
          checked={form.acceptsRules}
          onChange={(event) => updateForm("acceptsRules", event.target.checked)}
        />
        {t("copy.jeg.har.lest.og.forstatt.fiskereglene.for.mandal.8457e64")}
      </label>
      <label className="permit-consent">
        <input
          type="checkbox"
          checked={form.acceptsTerms}
          onChange={(event) => updateForm("acceptsTerms", event.target.checked)}
        />
        {t("copy.jeg.godtar.vilkarene.for.dette.simulerte.kj.pet.b27d12e")}
      </label>
      <div className="permit-checkout-actions">
        <button className="secondary" type="button" onClick={back}>
          {t("copy.tilbake.4fb8dc1")}
        </button>
        <button className="primary" type="button" onClick={next}>
          {t("copy.neste.kontroller.ad7f463")}
        </button>
      </div>
    </div>
  );
}
export function PermitReviewStep({
  product,
  selectedDate,
  form,
  updateForm,
  back,
  next,
}: {
  product: PrototypePermitProduct;
  selectedDate: string;
  form: PermitCheckoutForm;
  updateForm: UpdateForm;
  back: () => void;
  next: () => void;
}) {
  const { language, t } = useLanguage();
  const validity = calculatePermitValidity(product, selectedDate);
  const price = getPermitPriceSummary(product, form);
  return (
    <div className="permit-checkout-step">
      <h3>{t("copy.kontroller.bestillingen.1bd9bf4")}</h3>
      <dl className="permit-order-summary">
        <div>
          <dt>{t("copy.kort.12ed908")}</dt>
          <dd>{t(product.title)}</dd>
        </div>
        <div>
          <dt>{t("copy.omrade.3ba9267")}</dt>
          <dd>{t(product.areaName)}</dd>
        </div>
        <div>
          <dt>{t("copy.gyldig.d0441fd")}</dt>
          <dd>
            {validity.startsAt.replace("T", " ")} – {validity.endsAt.replace("T", " ")}
          </dd>
        </div>
        <div>
          <dt>{t("copy.kortholder.2628a15")}</dt>
          <dd>{form.fullName}</dd>
        </div>
        <PriceSummaryRows price={price} language={language} />
      </dl>
      <label className="permit-consent">
        <input
          type="checkbox"
          checked={form.confirmsDetails}
          onChange={(event) => updateForm("confirmsDetails", event.target.checked)}
        />
        {t("copy.jeg.bekrefter.at.opplysningene.er.riktige.159b496")}
      </label>
      <div className="permit-checkout-actions">
        <button className="secondary" type="button" onClick={back}>
          {t("copy.tilbake.og.endre.7334721")}
        </button>
        <button className="primary" type="button" onClick={next}>
          {t("copy.ga.til.testbetaling.315024d")}
        </button>
      </div>
    </div>
  );
}
export function PermitPaymentStep({
  product,
  form,
  back,
  submit,
  isSubmitting,
}: {
  product: PrototypePermitProduct;
  form: PermitCheckoutForm;
  back: () => void;
  submit: () => void;
  isSubmitting: boolean;
}) {
  const { language, t } = useLanguage();
  const price = getPermitPriceSummary(product, form);
  return (
    <div className="permit-checkout-step permit-payment-step">
      <small>{t("copy.sikker.testbetaling.cfbdf20")}</small>
      <h3>{t("copy.betal.fiskekortet.f9c5ba3")}</h3>
      <div className="permit-test-warning">
        <b>{t("copy.dette.er.en.simulert.betaling.4126f20")}</b>
        <span>{t("copy.ingen.kortopplysninger.registreres.og.ingen.peng.5d1179b")}</span>
      </div>
      <dl className="permit-order-summary">
        <div>
          <dt>{t("copy.betalingsmate.5026a1a")}</dt>
          <dd>{t("copy.testkort.4242.64ff459")}</dd>
        </div>
        <PriceSummaryRows price={price} language={language} />
      </dl>
      <p className="permit-no-real-payment">{t("copy.ingen.ekte.betaling.gjennomf.res.5e69190")}</p>
      <div className="permit-checkout-actions">
        <button className="secondary" type="button" disabled={isSubmitting} onClick={back}>
          {t("copy.tilbake.4fb8dc1")}
        </button>
        <button className="primary" type="button" disabled={isSubmitting} onClick={submit}>
          {isSubmitting
            ? t("copy.behandler.testbetaling.384e9f3")
            : `${t(selectLocalized(language, "Betal", "Pay"))} ${price.totalNok} kr`}
        </button>
      </div>
    </div>
  );
}
export function PermitConfirmationStep({
  product,
  receipt,
  purchase,
  openPermits,
  goHome,
  readiness,
  registerFee,
  registerDisinfection,
}: {
  product: PrototypePermitProduct;
  receipt: FishingDocument;
  purchase: PermitPurchase;
  openPermits: () => void;
  goHome: () => void;
  readiness: {
    fee: boolean;
    disinfection: boolean;
  };
  registerFee?: () => void;
  registerDisinfection?: () => void;
}) {
  const { language, t } = useLanguage();
  return (
    <div className="permit-checkout-step permit-confirmation" role="status">
      <span className="permit-confirmation-icon">✓</span>
      <small>{t("copy.testbetaling.godkjent.kj.pet.er.fullf.rt.db09d1d")}</small>
      <h3>{t("copy.fiskekortet.er.lagret.ceb7e12")}</h3>
      <p>{t("copy.ingen.penger.er.trukket.kortet.ligger.na.under.m.b92481b")}</p>
      <dl className="permit-order-summary">
        <div>
          <dt>{t("copy.kort.12ed908")}</dt>
          <dd>{t(product.title)}</dd>
        </div>
        <div>
          <dt>{t("copy.kortholder.2628a15")}</dt>
          <dd>{receipt.values.holder}</dd>
        </div>
        <div>
          <dt>{t("copy.sone.og.delsone.ee87de7")}</dt>
          <dd>
            {selectLocalized(language, "Sone", "Zone")} {product.zoneId} · {t(product.areaName)}
          </dd>
        </div>
        <div>
          <dt>{t("copy.bestillingsnummer.aa58839")}</dt>
          <dd>{purchase.orderNumber}</dd>
        </div>
        <div>
          <dt>{t("copy.testreferanse.ed0f389")}</dt>
          <dd>{purchase.paymentReference}</dd>
        </div>
        <div>
          <dt>{t("copy.gyldig.fra.32590ea")}</dt>
          <dd>{receipt.values.startsAt?.replace("T", " ")}</dd>
        </div>
        <div>
          <dt>{t("copy.gyldig.til.48b321b")}</dt>
          <dd>{receipt.values.endsAt?.replace("T", " ")}</dd>
        </div>
        <div>
          <dt>{t("copy.pris.b97114e")}</dt>
          <dd>
            {purchase.priceNok === null
              ? t("copy.ikke.oppgitt.1c7350b")
              : `${purchase.priceNok} kr`}
          </dd>
        </div>
        <div>
          <dt>{t("copy.utsteder.a468935")}</dt>
          <dd>{purchase.issuer}</dd>
        </div>
      </dl>
      {(!readiness.fee || !readiness.disinfection) && (
        <section className="permit-missing-documents" aria-labelledby="missing-documents-title">
          <h4 id="missing-documents-title">{t("copy.fullf.r.kravene.f.r.du.fisker.ba15348")}</h4>
          <p>{t("copy.fiskekortet.er.kj.pt.men.fiske.kan.ikke.startes..09b9f06")}</p>
          {!readiness.fee && registerFee && (
            <button className="secondary" type="button" onClick={registerFee}>
              {t("copy.registrer.fiskeravgift.dfcaa2c")}
            </button>
          )}
          {!readiness.disinfection && registerDisinfection && (
            <button className="secondary" type="button" onClick={registerDisinfection}>
              {t("copy.registrer.desinfisering.b92dd3a")}
            </button>
          )}
        </section>
      )}
      <div className="permit-confirmation-actions">
        <button className="primary" type="button" onClick={openPermits}>
          {t("copy.apne.fiskekort.8aece66")}
        </button>
        <button className="secondary" type="button" onClick={goHome}>
          {t("copy.tilbake.til.hjem.d935a7f")}
        </button>
      </div>
    </div>
  );
}
function PriceSummaryRows({
  price,
  language,
}: {
  price: ReturnType<typeof getPermitPriceSummary>;
  language: "no" | "en";
}) {
  const { t } = useLanguage();
  return (
    <>
      <div>
        <dt>{t("copy.grunnpris.69eff4c")}</dt>
        <dd>{price.basePriceNok} kr</dd>
      </div>
      <div>
        <dt>{t("copy.administrasjonsgebyr.d0ec567")}</dt>
        <dd>{price.administrationFeeNok === 0 ? "0 kr" : `${price.administrationFeeNok} kr`}</dd>
      </div>
      <div>
        <dt>{t("copy.omfang.5d26931")}</dt>
        <dd>
          {price.permitQuantity} {selectLocalized(language, "kort", "permit")} ·{" "}
          {price.participantCount}{" "}
          {selectLocalized(
            language,
            price.participantCount === 1 ? "deltaker" : "deltakere",
            price.participantCount === 1 ? "participant" : "participants",
          )}
        </dd>
      </div>
      <div className="permit-price-total">
        <dt>{t("copy.totalt.bel.p.8a2b1d8")}</dt>
        <dd>{price.totalNok} kr</dd>
      </div>
    </>
  );
}
