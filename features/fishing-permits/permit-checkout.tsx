"use client";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { getDocumentReadiness } from "@/domain/documents/get-document-readiness";
import { calculatePermitValidity } from "@/domain/fishing-permits/calculate-permit-validity";
import {
  formatPrototypePermitPrice,
  type PrototypePermitProduct,
} from "@/domain/fishing-permits/prototype-permit-product";
import type { OperationResult } from "@/domain/shared/operation-result";
import type { PermitPurchase } from "@/domain/fishing-permits/permit-purchase";
import {
  PermitBuyerStep,
  PermitConfirmationStep,
  PermitPaymentStep,
  PermitRequirementsStep,
  PermitReviewStep,
} from "./permit-checkout-steps";
import { usePermitCheckoutController } from "./use-permit-checkout-controller";
import { getPrototypePermitAvailability } from "@/domain/fishing-permits/get-prototype-permit-availability";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";
import { useLanguage } from "@/components/localization/language-provider";
const stepNumbers = { buyer: 1, requirements: 2, review: 3, payment: 4, confirmation: 5 } as const;
export function PermitCheckout({
  product,
  documents = [],
  back,
  save,
  savePurchase,
  onPurchased,
  onOpenPermits,
  onGoHome,
  paymentOutcome = "approved",
  initialSelectedDate,
  onRegisterFee,
  onRegisterDisinfection,
}: {
  product: PrototypePermitProduct;
  documents?: FishingDocument[];
  back: () => void;
  save: (document: FishingDocument) => Promise<OperationResult<void>>;
  savePurchase: (purchase: PermitPurchase) => OperationResult<void>;
  onPurchased?: (zoneId: PrototypePermitProduct["zoneId"]) => void;
  onOpenPermits?: () => void;
  onGoHome?: () => void;
  paymentOutcome?: PrototypePaymentOutcome;
  initialSelectedDate?: string;
  onRegisterFee?: () => void;
  onRegisterDisinfection?: () => void;
}) {
  const { t } = useLanguage();
  const checkout = usePermitCheckoutController({
    product,
    save,
    savePurchase,
    onPurchased,
    paymentOutcome,
    initialSelectedDate,
  });
  const availability = getPrototypePermitAvailability(product, checkout.selectedDate);
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
    <section className="permit-checkout" aria-label={t("copy.kj.p.fiskekort.d32ea04")}>
      {checkout.step !== "confirmation" && (
        <button className="back" type="button" onClick={back}>
          {t("copy.tilbake.til.fiskekort.bcb4b52")}
        </button>
      )}
      <ol className="permit-checkout-progress" aria-label={t("copy.fremdrift.feea71d")}>
        {[1, 2, 3, 4, 5].map((number) => (
          <li
            key={number}
            aria-current={stepNumbers[checkout.step] === number ? "step" : undefined}
          >
            {number}
          </li>
        ))}
      </ol>
      <div className="permit-test-warning">
        <b>{t("copy.testkj.p.dette.er.en.prototype.d619945")}</b>
        <span>{t("copy.ingen.reservasjon.eller.betaling.gjennomf.res.2f46e3e")}</span>
      </div>
      <article className="permit-selected-product">
        <small>{t(product.areaName)}</small>
        <h2>{t(product.title)}</h2>
        <b>{formatPrototypePermitPrice(product)}</b>
        <p>{t(product.validity.label)}</p>
      </article>
      {checkout.step === "buyer" && (
        <PermitBuyerStep
          selectedDate={checkout.selectedDate}
          form={checkout.form}
          updateForm={checkout.updateForm}
          availability={availability}
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
          back={() => checkout.backTo("requirements")}
          next={checkout.continueToPayment}
        />
      )}
      {checkout.step === "payment" && (
        <PermitPaymentStep
          product={product}
          form={checkout.form}
          back={() => checkout.backTo("review")}
          submit={() => void checkout.submit()}
          isSubmitting={checkout.isSubmitting}
        />
      )}
      {checkout.step === "confirmation" && checkout.receipt && (
        <PermitConfirmationStep
          product={product}
          receipt={checkout.receipt.document}
          purchase={checkout.receipt.purchase}
          openPermits={onOpenPermits ?? back}
          goHome={onGoHome ?? back}
          readiness={{ fee: readiness.fee, disinfection: readiness.disinfection }}
          registerFee={onRegisterFee}
          registerDisinfection={onRegisterDisinfection}
        />
      )}
      {checkout.error && (
        <p className="permit-payment-result error" role="alert">
          {t(checkout.error)}
        </p>
      )}
    </section>
  );
}
