"use client";
import { createLocalStoragePermitPurchaseRepository } from "@/data/local-storage/create-local-storage-permit-purchase-repository";
import { readProfile } from "@/features/profile/local-profile";
import { getAppNow, getAppDate } from "@/domain/shared/app-clock";

import type { PermitReceipt } from "./permit-journey";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
import { useDraft, useDraftState } from "@/hooks/use-draft";
import { useRef, useState } from "react";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { calculatePermitValidity } from "@/domain/fishing-permits/calculate-permit-validity";
import {
  emptyPermitCheckoutForm,
  parseCoFishers,
  validatePermitBuyer,
  validatePermitParticipants,
  type PermitCheckoutForm,
  type PermitPurchase,
  type PrototypePaymentOutcome,
  permitTermsVersion,
  prototypePermitIssuer,
  getPermitPriceSummary,
} from "@/domain/fishing-permits/permit-purchase";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import { canPurchasePrototypePermit } from "@/domain/fishing-permits/prototype-permit-product";
import type { OperationResult } from "@/domain/shared/operation-result";
import { createTestPermitDocument } from "./create-test-permit-document";
import { createLocalId } from "@/lib/create-local-id";
import {
  canSelectPrototypePermit,
  getPrototypePermitAvailability,
} from "@/domain/fishing-permits/get-prototype-permit-availability";

export type CheckoutStep = "buyer" | "review" | "payment" | "confirmation";

function todayInNorway() {
  return getAppDate();
}

export function usePermitCheckoutController({
  product,
  save,
  savePurchase,
  onPurchased,
  paymentOutcome,
  initialSelectedDate,
  initialForm,
  onFormChange,
  initialReceipt,
  onReceipt,
}: {
  product: PrototypePermitProduct;
  save: (document: FishingDocument) => Promise<OperationResult<void>>;
  savePurchase: (purchase: PermitPurchase) => OperationResult<void>;
  onPurchased?: (zoneId: PrototypePermitProduct["zoneId"]) => void;
  paymentOutcome: PrototypePaymentOutcome;
  initialSelectedDate?: string;
  initialForm?: PermitCheckoutForm;
  onFormChange?: (form: PermitCheckoutForm) => void;
  initialReceipt?: PermitReceipt;
  onReceipt?: (receipt: PermitReceipt) => void;
}) {
  const draft = useDraft();
  const { language } = useLanguage();
  const [step, setStep] = useDraftState<CheckoutStep>(
    "step",
    initialReceipt ? "confirmation" : "buyer",
  );
  const [selectedDate] = useState(() => {
    if (initialSelectedDate) return initialSelectedDate;
    return todayInNorway();
  });
  const [form, setForm] = useDraftState<PermitCheckoutForm>(
    "form",
    draft?.discarded
      ? { ...emptyPermitCheckoutForm, ...readProfile() }
      : (initialForm ?? { ...emptyPermitCheckoutForm, ...readProfile() }),
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{
    document: FishingDocument;
    purchase: PermitPurchase;
  } | null>(initialReceipt ?? null);
  const submissionLock = useRef(false);
  const [attempt, setAttempt] = useDraftState<{ key: string; now: number; id: string } | null>(
    "purchaseAttempt",
    null,
  );

  function currentAvailability() {
    const result = createLocalStoragePermitPurchaseRepository(window.localStorage).list();
    if (!result.ok)
      return { status: "not-on-sale" as const, label: result.error, remainingUnits: 0 };
    return getPrototypePermitAvailability(
      product,
      selectedDate,
      language,
      undefined,
      result.value.filter(
        (purchase) =>
          purchase.id !==
          (attempt?.key === JSON.stringify([product.id, selectedDate, form])
            ? attempt.id
            : undefined),
      ),
    );
  }
  function updateForm<Key extends keyof PermitCheckoutForm>(
    key: Key,
    value: PermitCheckoutForm[Key],
  ) {
    const updated = { ...form, [key]: value };
    setForm(updated);
    onFormChange?.(updated);
    setError("");
  }

  function continueFromBuyer() {
    if (!canPurchasePrototypePermit(product))
      return setError("Dette kortet kan ikke kjøpes før prisen er bekreftet hos selger.");
    const buyerError = validatePermitBuyer(form);
    if (buyerError) return setError(buyerError);
    try {
      calculatePermitValidity(product, selectedDate);
    } catch {
      return setError("Velg en gyldig fiskedato for dette kortet.");
    }
    const availability = currentAvailability();
    if (!canSelectPrototypePermit(availability)) return setError(availability.label);
    setError("");
    const participantError = validatePermitParticipants(product, form);
    if (participantError) return setError(participantError);
    setStep("payment");
  }

  function paymentError(message: string) {
    setStep("buyer");
    setError(message);
  }

  async function submit() {
    if (submissionLock.current || receipt) return;
    const validationError = validatePermitBuyer(form) || validatePermitParticipants(product, form);
    if (validationError) {
      setStep("buyer");
      return setError(validationError);
    }
    try {
      calculatePermitValidity(product, selectedDate);
    } catch {
      return paymentError("Velg en gyldig fiskedato for dette kortet.");
    }
    if (!canPurchasePrototypePermit(product))
      return paymentError("Dette kortet kan ikke kjøpes før prisen er bekreftet hos selger.");
    const availability = currentAvailability();
    if (!canSelectPrototypePermit(availability)) return paymentError(availability.label);
    submissionLock.current = true;
    setIsSubmitting(true);
    try {
      const key = JSON.stringify([product.id, selectedDate, form]);
      const currentAttempt =
        attempt?.key === key
          ? attempt
          : { key, now: getAppNow(), id: `permit-purchase-${createLocalId()}` };
      setAttempt(currentAttempt);
      const { now, id: purchaseId } = currentAttempt;
      const orderNumber = `EF-${String(now).slice(-8)}`;
      const paymentReference = `EF-TEST-${now}`;
      const price = getPermitPriceSummary(product, form);
      const basePurchase: PermitPurchase = {
        id: purchaseId,
        orderNumber,
        productId: product.id,
        buyer: {
          fullName: form.fullName.trim(),
          birthDate: form.birthDate,
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
        coFishers: parseCoFishers(form.coFishersText),
        priceNok: price.totalNok,
        fishingDate: selectedDate,
        acceptedRulesAt: now,
        acceptedTermsAt: now,
        createdAt: now,
        status: paymentOutcome === "approved" ? "payment-approved" : paymentOutcome,
        termsVersion: permitTermsVersion,
        issuer: prototypePermitIssuer,
      };
      if (paymentOutcome !== "approved") {
        const purchase: PermitPurchase = {
          ...basePurchase,
          status: paymentOutcome,
          ...(paymentOutcome === "cancelled" ? { cancelledAt: now } : {}),
        };
        const stored = savePurchase(purchase);
        setIsSubmitting(false);
        if (!stored.ok) return paymentError(stored.error);
        return paymentError(
          paymentOutcome === "cancelled"
            ? "Betalingen ble avbrutt. Bestillingen er registrert, men ingen kort ble utstedt."
            : "Testbetalingen feilet. Bestillingen er registrert, men ingen kort ble utstedt.",
        );
      }
      const approvedPurchase: PermitPurchase = {
        ...basePurchase,
        status: "payment-approved",
        paidAt: now,
        paymentReference,
      };
      const purchaseStored = savePurchase(approvedPurchase);
      if (!purchaseStored.ok) {
        setIsSubmitting(false);
        return paymentError(purchaseStored.error);
      }
      const document = createTestPermitDocument(product, selectedDate, now, approvedPurchase);
      const result = await save(document);
      setIsSubmitting(false);
      if (!result.ok) {
        savePurchase({ ...approvedPurchase, status: "issuance-failed" });
        return paymentError(result.error);
      }
      const completedPurchase: PermitPurchase = {
        ...approvedPurchase,
        status: "completed",
        documentId: document.id,
        completedAt: getAppNow(),
      };
      const completed = savePurchase(completedPurchase);
      if (!completed.ok) return paymentError(completed.error);
      const receipt = { document, purchase: completedPurchase };
      await draft?.complete();
      setReceipt(receipt);
      onReceipt?.(receipt);
      setError("");
      setStep("confirmation");
      onPurchased?.(product.zoneId);
    } catch {
      paymentError(
        selectLocalized(
          language,
          "Kunne ikke lagre kjøpet. Opplysningene er bevart. Prøv igjen.",
          "Could not save the purchase. Your details have been kept. Please try again.",
        ),
      );
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  }

  return {
    heldPurchaseId:
      attempt?.key === JSON.stringify([product.id, selectedDate, form]) ? attempt.id : undefined,
    step,
    selectedDate,
    form,
    updateForm,
    error,
    isSubmitting,
    receipt,
    continueFromBuyer,
    submit,
    openPayment: () => {
      setError("");
      setStep("payment");
    },
    cancelPayment: () => {
      if (submissionLock.current) return;
      setStep("buyer");
      setError(
        selectLocalized(
          language,
          "Betalingen ble avbrutt. Du kan prøve igjen.",
          "Payment cancelled. You can try again.",
        ),
      );
    },
    backTo: (target: CheckoutStep) => {
      setError("");
      setStep(target);
    },
  };
}
