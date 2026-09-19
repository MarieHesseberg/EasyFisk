"use client";
import { parseRiverDateTime } from "@/domain/shared/river-time";

import { usePermitPurchases } from "./use-permit-purchases";
import { emptyPermitCheckoutForm } from "@/domain/fishing-permits/permit-purchase";
import { DraftScope, DraftControls } from "@/hooks/use-draft";
import { useEffect, useRef } from "react";
import type { PermitReceipt } from "./permit-journey";
import type { PermitCheckoutForm } from "@/domain/fishing-permits/permit-purchase";
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
  PermitRequirementsStep,
  PermitReviewStep,
} from "./permit-checkout-steps";
import { usePermitCheckoutController } from "./use-permit-checkout-controller";
import { getPrototypePermitAvailability } from "@/domain/fishing-permits/get-prototype-permit-availability";
import type { PrototypePaymentOutcome } from "@/domain/fishing-permits/permit-purchase";
import { useLanguage } from "@/components/localization/language-provider";
import { PermitVippsPayment } from "./permit-vipps-payment";
const stepNumbers = { buyer: 1, review: 1, payment: 2, confirmation: 3 } as const;
function PermitCheckoutContent({
  product,
  documents = [],
  back,
  save,
  saveMany,
  savePurchase,
  onPurchased,
  onOpenPermits,
  onGoHome,
  paymentOutcome = "approved",
  initialSelectedDate,
  initialForm,
  onFormChange,
  initialReceipt,
  onReceipt,
  onRegisterFee,
  onRegisterDisinfection,
}: {
  product: PrototypePermitProduct;
  documents?: FishingDocument[];
  back: () => void;
  save: (document: FishingDocument) => Promise<OperationResult<void>>;
  saveMany?: (documents: FishingDocument[]) => Promise<OperationResult<void>>;
  savePurchase: (
    purchase: PermitPurchase,
  ) => OperationResult<void> | Promise<OperationResult<void>>;
  onPurchased?: (zoneId: PrototypePermitProduct["zoneId"]) => void;
  onOpenPermits?: () => void;
  onGoHome?: () => void;
  paymentOutcome?: PrototypePaymentOutcome;
  initialSelectedDate?: string;
  initialForm?: PermitCheckoutForm;
  onFormChange?: (form: PermitCheckoutForm) => void;
  initialReceipt?: PermitReceipt;
  onReceipt?: (receipt: PermitReceipt) => void;
  onRegisterFee?: () => void;
  onRegisterDisinfection?: () => void;
}) {
  const { t } = useLanguage();
  const { purchases } = usePermitPurchases();
  const checkout = usePermitCheckoutController({
    product,
    save,
    saveMany,
    savePurchase,
    onPurchased,
    paymentOutcome,
    initialSelectedDate,
    initialForm,
    onFormChange,
    initialReceipt,
    onReceipt,
  });
  const checkoutRef = useRef<HTMLElement>(null);
  useEffect(() => {
    checkoutRef.current?.scrollIntoView?.({ block: "start" });
    checkoutRef.current?.focus({ preventScroll: true });
  }, [checkout.step]);
  const availability = getPrototypePermitAvailability(
    product,
    checkout.selectedDate,
    undefined,
    undefined,
    purchases.filter((purchase) => purchase.id !== checkout.heldPurchaseId),
  );
  let validity = null;
  try {
    validity = calculatePermitValidity(product, checkout.selectedDate);
  } catch {
    // Ugyldig dato forklares når brukeren forsøker å gå videre.
  }
  const readiness = getDocumentReadiness(
    documents,
    validity
      ? parseRiverDateTime(validity.startsAt)
      : parseRiverDateTime(`${checkout.selectedDate}T12:00:00`),
    product.zoneId,
  ).valid;
  return (
    <section
      ref={checkoutRef}
      tabIndex={-1}
      className="permit-checkout"
      aria-label={t("copy.kj.p.fiskekort.d32ea04")}
    >
      {checkout.step !== "confirmation" && <DraftControls disabled={checkout.isSubmitting} />}
      {checkout.step !== "confirmation" && checkout.step !== "payment" && (
        <button className="back" type="button" onClick={back} disabled={checkout.isSubmitting}>
          {t("copy.tilbake.til.fiskekort.bcb4b52")}
        </button>
      )}
      <ol className="permit-checkout-progress" aria-label={t("copy.fremdrift.feea71d")}>
        {[1, 2, 3].map((number) => (
          <li
            key={number}
            aria-current={stepNumbers[checkout.step] === number ? "step" : undefined}
          >
            {number}
          </li>
        ))}
      </ol>
      {(checkout.step === "buyer" || checkout.step === "review") && (
        <article className="permit-selected-product">
          <small>{t(product.areaName)}</small>
          <h2>{t(product.title)}</h2>
          <b>{formatPrototypePermitPrice(product)}</b>
          <p>{t(product.validity.label)}</p>
        </article>
      )}
      {(checkout.step === "buyer" || checkout.step === "review") && (
        <PermitBuyerStep
          multipleDates={product.type === "day"}
          embedded
          selectedDate={checkout.selectedDate}
          form={checkout.form}
          updateForm={checkout.updateForm}
          availability={availability}
          next={checkout.continueFromBuyer}
        />
      )}
      {(checkout.step === "buyer" || checkout.step === "review") && (
        <PermitRequirementsStep
          embedded
          product={product}
          form={checkout.form}
          updateForm={checkout.updateForm}
          readiness={{ fee: readiness.fee, disinfection: readiness.disinfection }}
          back={back}
          next={checkout.continueFromBuyer}
        />
      )}
      {(checkout.step === "buyer" || checkout.step === "review") && validity && (
        <PermitReviewStep
          embedded
          product={product}
          selectedDate={checkout.selectedDate}
          form={checkout.form}
          updateForm={checkout.updateForm}
          isSubmitting={checkout.isSubmitting}
          back={() => checkout.backTo("buyer")}
          next={checkout.continueFromBuyer}
        />
      )}
      {checkout.step === "payment" && (
        <PermitVippsPayment
          product={product}
          form={checkout.form}
          isSubmitting={checkout.isSubmitting}
          approve={() => void checkout.submit()}
          cancel={checkout.cancelPayment}
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

export function PermitCheckout(props: Parameters<typeof PermitCheckoutContent>[0]) {
  const id = `purchase:${props.product.id}:${props.initialSelectedDate ?? "default"}`;
  return (
    <DraftScope key={id} id={id} onDiscard={() => props.onFormChange?.(emptyPermitCheckoutForm)}>
      <PermitCheckoutContent {...props} />
    </DraftScope>
  );
}
