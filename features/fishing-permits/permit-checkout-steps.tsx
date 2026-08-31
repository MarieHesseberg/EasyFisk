import type { FishingDocument } from "@/domain/documents/fishing-document";
import { calculatePermitValidity } from "@/domain/fishing-permits/calculate-permit-validity";
import type { PermitCheckoutForm } from "@/domain/fishing-permits/permit-purchase";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import type { PaymentOutcome } from "./use-permit-checkout-controller";

type UpdateForm = <Key extends keyof PermitCheckoutForm>(
  key: Key,
  value: PermitCheckoutForm[Key],
) => void;

export function PermitBuyerStep({
  selectedDate,
  setSelectedDate,
  form,
  updateForm,
  next,
}: {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  form: PermitCheckoutForm;
  updateForm: UpdateForm;
  next: () => void;
}) {
  return (
    <div className="permit-checkout-step">
      <h3>Fiskedato og kortinnehaver</h3>
      <p>Kortet utstedes til personen som skal være ansvarlig for kjøpet.</p>
      <label>
        Fiskedato
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </label>
      <label>
        Fullt navn
        <input
          autoComplete="name"
          value={form.fullName}
          onChange={(event) => updateForm("fullName", event.target.value)}
        />
      </label>
      <label>
        Fødselsdato
        <input
          type="date"
          autoComplete="bday"
          value={form.birthDate}
          onChange={(event) => updateForm("birthDate", event.target.value)}
        />
      </label>
      <label>
        E-post
        <input
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => updateForm("email", event.target.value)}
        />
      </label>
      <label>
        Telefon
        <input
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(event) => updateForm("phone", event.target.value)}
        />
      </label>
      <button className="primary" type="button" onClick={next}>
        Neste · krav og deltakere
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
  readiness: { fee: boolean; disinfection: boolean };
  back: () => void;
  next: () => void;
}) {
  return (
    <div className="permit-checkout-step">
      <h3>Deltakere og fiskekrav</h3>
      {product.type === "group" && (
        <label>
          Medfiskere – ett fullt navn per linje
          <textarea
            rows={4}
            value={form.coFishersText}
            onChange={(event) => updateForm("coFishersText", event.target.value)}
          />
        </label>
      )}
      <div className="permit-requirement-status" aria-label="Dokumentstatus ved fiskedato">
        <b>Dokumenter kontrolleres igjen når fisket starter</b>
        {product.requirements.requiresNationalFishingFee && (
          <span>
            {readiness.fee ? "✓ Fiskeravgift registrert" : "! Fiskeravgift mangler eller er utløpt"}
          </span>
        )}
        {product.requirements.requiresDisinfection && (
          <span>
            {readiness.disinfection
              ? "✓ Desinfisering registrert"
              : "! Desinfisering mangler eller er utløpt"}
          </span>
        )}
      </div>
      <label className="permit-consent">
        <input
          type="checkbox"
          checked={form.acceptsRules}
          onChange={(event) => updateForm("acceptsRules", event.target.checked)}
        />
        Jeg har lest og forstått fiskereglene for Mandalselva.
      </label>
      <label className="permit-consent">
        <input
          type="checkbox"
          checked={form.acceptsTerms}
          onChange={(event) => updateForm("acceptsTerms", event.target.checked)}
        />
        Jeg godtar vilkårene for dette simulerte kjøpet.
      </label>
      <div className="permit-checkout-actions">
        <button className="secondary" type="button" onClick={back}>
          Tilbake
        </button>
        <button className="primary" type="button" onClick={next}>
          Neste · kontroller
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
  outcome,
  setOutcome,
  back,
  submit,
  isSubmitting,
}: {
  product: PrototypePermitProduct;
  selectedDate: string;
  form: PermitCheckoutForm;
  updateForm: UpdateForm;
  outcome: PaymentOutcome;
  setOutcome: (value: PaymentOutcome) => void;
  back: () => void;
  submit: () => void;
  isSubmitting: boolean;
}) {
  const validity = calculatePermitValidity(product, selectedDate);
  return (
    <div className="permit-checkout-step">
      <h3>Kontroller og betal</h3>
      <dl className="permit-order-summary">
        <div>
          <dt>Kort</dt>
          <dd>{product.title}</dd>
        </div>
        <div>
          <dt>Område</dt>
          <dd>{product.areaName}</dd>
        </div>
        <div>
          <dt>Gyldig</dt>
          <dd>
            {validity.startsAt.replace("T", " ")} – {validity.endsAt.replace("T", " ")}
          </dd>
        </div>
        <div>
          <dt>Kortholder</dt>
          <dd>{form.fullName}</dd>
        </div>
        <div>
          <dt>Pris</dt>
          <dd>
            {product.price.amountNok === null ? "Ikke oppgitt" : `${product.price.amountNok} kr`}
          </dd>
        </div>
      </dl>
      <fieldset>
        <legend>Simulert betalingsresultat</legend>
        {(["approved", "cancelled", "failed"] as const).map((value) => (
          <label className="permit-consent" key={value}>
            <input
              type="radio"
              name="payment-outcome"
              checked={outcome === value}
              onChange={() => setOutcome(value)}
            />
            {value === "approved"
              ? "Betaling godkjent"
              : value === "cancelled"
                ? "Betaling avbrutt"
                : "Betaling feilet"}
          </label>
        ))}
      </fieldset>
      <label className="permit-consent">
        <input
          type="checkbox"
          checked={form.confirmsDetails}
          onChange={(event) => updateForm("confirmsDetails", event.target.checked)}
        />
        Jeg bekrefter at opplysningene er riktige.
      </label>
      <div className="permit-checkout-actions">
        <button className="secondary" type="button" onClick={back}>
          Tilbake og endre
        </button>
        <button className="primary" type="button" disabled={isSubmitting} onClick={submit}>
          {isSubmitting ? "Lagrer testkjøp …" : "Utfør testbetaling"}
        </button>
      </div>
    </div>
  );
}

export function PermitConfirmationStep({
  product,
  receipt,
  done,
}: {
  product: PrototypePermitProduct;
  receipt: FishingDocument;
  done: () => void;
}) {
  return (
    <div className="permit-checkout-step permit-confirmation" role="status">
      <span className="permit-confirmation-icon">✓</span>
      <small>Testkjøpet er fullført</small>
      <h3>Fiskekortet er lagret</h3>
      <p>
        Ingen penger er trukket. Kortet ligger nå under Mine fiskekort og brukes av
        statuskontrollen.
      </p>
      <dl className="permit-order-summary">
        <div>
          <dt>Kort</dt>
          <dd>{product.title}</dd>
        </div>
        <div>
          <dt>Kortholder</dt>
          <dd>{receipt.values.holder}</dd>
        </div>
        <div>
          <dt>Betalingsreferanse</dt>
          <dd>{receipt.purchase?.paymentReference}</dd>
        </div>
        <div>
          <dt>Gyldig fra</dt>
          <dd>{receipt.values.startsAt?.replace("T", " ")}</dd>
        </div>
        <div>
          <dt>Gyldig til</dt>
          <dd>{receipt.values.endsAt?.replace("T", " ")}</dd>
        </div>
      </dl>
      <button className="primary" type="button" onClick={done}>
        Tilbake til fiskekort
      </button>
    </div>
  );
}
