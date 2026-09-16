"use client";

import type { PermitReceipt } from "./permit-journey";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
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
import {
  canSelectPrototypePermit,
  getPrototypePermitAvailability,
  getPrototypePermitDateRange,
} from "@/domain/fishing-permits/get-prototype-permit-availability";

export type CheckoutStep = "buyer" | "review" | "confirmation";

function todayInNorway() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
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
  const { language } = useLanguage();
  const [step, setStep] = useState<CheckoutStep>(initialReceipt ? "confirmation" : "buyer");
  const [selectedDate] = useState(() => {
    if (initialSelectedDate) return initialSelectedDate;
    const today = todayInNorway();
    const range = getPrototypePermitDateRange(product);
    if (product.type === "season" || today < range.startsOn) return range.startsOn;
    if (today > range.endsOn) return range.endsOn;
    return today;
  });
  const [form, setForm] = useState<PermitCheckoutForm>(initialForm ?? emptyPermitCheckoutForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{
    document: FishingDocument;
    purchase: PermitPurchase;
  } | null>(initialReceipt ?? null);
  const submissionLock = useRef(false);
  const attempt = useRef<{ key: string; now: number; id: string } | null>(null);

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
    const availability = getPrototypePermitAvailability(product, selectedDate);
    if (!canSelectPrototypePermit(availability)) return setError(availability.label);
    setError("");
    const participantError = validatePermitParticipants(product, form);
    if (participantError) return setError(participantError);
    setStep("review");
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
      return setError("Velg en gyldig fiskedato for dette kortet.");
    }
    if (!canPurchasePrototypePermit(product))
      return setError("Dette kortet kan ikke kjøpes før prisen er bekreftet hos selger.");
    const availability = getPrototypePermitAvailability(product, selectedDate);
    if (!canSelectPrototypePermit(availability)) return setError(availability.label);
    submissionLock.current = true;
    setIsSubmitting(true);
    try {
      const key = JSON.stringify([product.id, selectedDate, form]);
      if (attempt.current?.key !== key)
        attempt.current = { key, now: Date.now(), id: `permit-purchase-${crypto.randomUUID()}` };
      const { now, id: purchaseId } = attempt.current;
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
        if (!stored.ok) return setError(stored.error);
        return setError(
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
        return setError(purchaseStored.error);
      }
      const document = createTestPermitDocument(product, selectedDate, now, approvedPurchase);
      const result = await save(document);
      setIsSubmitting(false);
      if (!result.ok) {
        savePurchase({ ...approvedPurchase, status: "issuance-failed" });
        return setError(result.error);
      }
      const completedPurchase: PermitPurchase = {
        ...approvedPurchase,
        status: "completed",
        documentId: document.id,
        completedAt: Date.now(),
      };
      const completed = savePurchase(completedPurchase);
      if (!completed.ok) return setError(completed.error);
      const receipt = { document, purchase: completedPurchase };
      setReceipt(receipt);
      onReceipt?.(receipt);
      setError("");
      setStep("confirmation");
      onPurchased?.(product.zoneId);
    } catch {
      setError(
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
    step,
    selectedDate,
    form,
    updateForm,
    error,
    isSubmitting,
    receipt,
    continueFromBuyer,
    submit,
    backTo: (target: CheckoutStep) => {
      setError("");
      setStep(target);
    },
  };
}
