"use client";

import { useState } from "react";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import type { OperationResult } from "@/domain/shared/operation-result";
import { createTestPermitDocument } from "./create-test-permit-document";

type PaymentOutcome = "approved" | "cancelled" | "failed";

const outcomeLabels: Record<PaymentOutcome, string> = {
  approved: "Betaling godkjent",
  cancelled: "Betaling avbrutt",
  failed: "Betaling feilet",
};

export function PermitCheckout({
  product,
  back,
  save,
  onPurchased,
}: {
  product: PrototypePermitProduct;
  back: () => void;
  save: (document: FishingDocument) => Promise<OperationResult<void>>;
  onPurchased?: (zoneId: PrototypePermitProduct["zoneId"]) => void;
}) {
  const [outcome, setOutcome] = useState<PaymentOutcome>("approved");
  const [status, setStatus] = useState<"idle" | PaymentOutcome | "saving-error" | "invalid-date">(
    "idle",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() =>
    new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()),
  );

  async function submit() {
    if (outcome !== "approved") {
      setStatus(outcome);
      return;
    }
    setIsSubmitting(true);
    let document: FishingDocument;
    try {
      document = createTestPermitDocument(product, selectedDate);
    } catch {
      setIsSubmitting(false);
      setStatus("invalid-date");
      return;
    }
    const result = await save(document);
    setIsSubmitting(false);
    setStatus(result.ok ? "approved" : "saving-error");
    if (result.ok) onPurchased?.(product.zoneId);
  }

  return (
    <section className="permit-checkout" aria-label="Testbetaling">
      <button className="back" type="button" onClick={back}>
        ‹ Tilbake til fiskekort
      </button>
      <div className="permit-test-warning">
        <b>Testbetaling – dette er en prototype.</b>
        <span>Ingen betaling gjennomføres og ingen penger trekkes.</span>
      </div>
      <article>
        <small>{product.areaName}</small>
        <h3>{product.title}</h3>
        <b>
          {product.price.amountNok === null
            ? "Testpris ikke oppgitt"
            : `${product.price.amountNok} kr`}
        </b>
        <p>{product.validity.label}</p>
      </article>
      <label className="permit-test-date">
        Testdato for fiskekortet
        <input
          type="date"
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value);
            setStatus("idle");
          }}
        />
        <small>
          Velg dagens dato for et gyldig kort, eller en tidligere dato for å teste utløp.
        </small>
      </label>
      <fieldset>
        <legend>Velg resultat for testbetalingen</legend>
        {Object.entries(outcomeLabels).map(([value, label]) => (
          <label key={value}>
            <input
              type="radio"
              name="payment-outcome"
              value={value}
              checked={outcome === value}
              onChange={() => {
                setOutcome(value as PaymentOutcome);
                setStatus("idle");
              }}
            />
            {label}
          </label>
        ))}
      </fieldset>
      <button
        className="primary"
        type="button"
        disabled={isSubmitting}
        onClick={() => void submit()}
      >
        {isSubmitting ? "Lagrer testkjøp …" : "Utfør testbetaling"}
      </button>
      {status !== "idle" && (
        <div
          className={`permit-payment-result ${status === "approved" ? "success" : "error"}`}
          role={status === "approved" ? "status" : "alert"}
        >
          <b>
            {status === "approved"
              ? "Betaling godkjent"
              : status === "cancelled"
                ? "Betalingen ble avbrutt"
                : status === "failed"
                  ? "Testbetalingen feilet"
                  : status === "invalid-date"
                    ? "Velg en gyldig fiskedato"
                    : "Kortet kunne ikke lagres"}
          </b>
          <span>
            {status === "approved"
              ? "Testkortet er lagret under Mine fiskekort og overlever refresh."
              : "Ingen fiskekort ble lagret og ingen betaling ble gjennomført."}
          </span>
        </div>
      )}
    </section>
  );
}
