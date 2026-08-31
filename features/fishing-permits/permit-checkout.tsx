"use client";

import type { FishingDocument } from "@/domain/documents/fishing-document";
import { getDocumentReadiness } from "@/domain/documents/get-document-readiness";
import { calculatePermitValidity } from "@/domain/fishing-permits/calculate-permit-validity";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import type { OperationResult } from "@/domain/shared/operation-result";
import {
  PermitBuyerStep,
  PermitConfirmationStep,
  PermitRequirementsStep,
  PermitReviewStep,
} from "./permit-checkout-steps";
import { usePermitCheckoutController } from "./use-permit-checkout-controller";

const stepNumbers = { buyer: 1, requirements: 2, review: 3, confirmation: 4 } as const;

export function PermitCheckout({
  product,
  documents = [],
  back,
  save,
  onPurchased,
}: {
  product: PrototypePermitProduct;
  documents?: FishingDocument[];
  back: () => void;
  save: (document: FishingDocument) => Promise<OperationResult<void>>;
  onPurchased?: (zoneId: PrototypePermitProduct["zoneId"]) => void;
}) {
  const checkout = usePermitCheckoutController({ product, save, onPurchased });
  let validity = null;
  try {
    validity = calculatePermitValidity(product, checkout.selectedDate);
  } catch {
    // Ugyldig dato forklares når brukeren forsøker å gå videre.
  }
  const readiness = getDocumentReadiness(
    documents,
    validity ? Date.parse(validity.startsAt) : Date.parse(`${checkout.selectedDate}T12:00:00`),
    product.zoneId,
  ).valid;

  return (
    <section className="permit-checkout" aria-label="Kjøp fiskekort">
      {checkout.step !== "confirmation" && (
        <button className="back" type="button" onClick={back}>
          ‹ Tilbake til fiskekort
        </button>
      )}
      <ol className="permit-checkout-progress" aria-label="Fremdrift">
        {[1, 2, 3, 4].map((number) => (
          <li
            key={number}
            aria-current={stepNumbers[checkout.step] === number ? "step" : undefined}
          >
            {number}
          </li>
        ))}
      </ol>
      <div className="permit-test-warning">
        <b>Testkjøp – dette er en prototype.</b>
        <span>Ingen reservasjon eller betaling gjennomføres.</span>
      </div>
      <article className="permit-selected-product">
        <small>{product.areaName}</small>
        <h2>{product.title}</h2>
        <b>
          {product.price.amountNok === null
            ? "Testpris ikke oppgitt"
            : `${product.price.amountNok} kr`}
        </b>
        <p>{product.validity.label}</p>
      </article>
      {checkout.step === "buyer" && (
        <PermitBuyerStep
          selectedDate={checkout.selectedDate}
          setSelectedDate={checkout.setSelectedDate}
          form={checkout.form}
          updateForm={checkout.updateForm}
          next={checkout.continueFromBuyer}
        />
      )}
      {checkout.step === "requirements" && (
        <PermitRequirementsStep
          product={product}
          form={checkout.form}
          updateForm={checkout.updateForm}
          readiness={{ fee: readiness.fee, disinfection: readiness.disinfection }}
          back={() => checkout.backTo("buyer")}
          next={checkout.continueFromRequirements}
        />
      )}
      {checkout.step === "review" && (
        <PermitReviewStep
          product={product}
          selectedDate={checkout.selectedDate}
          form={checkout.form}
          updateForm={checkout.updateForm}
          outcome={checkout.outcome}
          setOutcome={checkout.setOutcome}
          back={() => checkout.backTo("requirements")}
          submit={() => void checkout.submit()}
          isSubmitting={checkout.isSubmitting}
        />
      )}
      {checkout.step === "confirmation" && checkout.receipt && (
        <PermitConfirmationStep product={product} receipt={checkout.receipt} done={back} />
      )}
      {checkout.error && (
        <p className="permit-payment-result error" role="alert">
          {checkout.error}
        </p>
      )}
    </section>
  );
}
