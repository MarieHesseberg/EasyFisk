"use client";

import { useState } from "react";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { calculatePermitValidity } from "@/domain/fishing-permits/calculate-permit-validity";
import {
  emptyPermitCheckoutForm,
  parseCoFishers,
  validatePermitBuyer,
  validatePermitParticipants,
  type PermitCheckoutForm,
  type PermitPurchase,
  permitTermsVersion,
  prototypePermitIssuer,
} from "@/domain/fishing-permits/permit-purchase";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import { canPurchasePrototypePermit } from "@/domain/fishing-permits/prototype-permit-product";
import type { OperationResult } from "@/domain/shared/operation-result";
import { createTestPermitDocument } from "./create-test-permit-document";
import {
  canSelectPrototypePermit,
  getPrototypePermitAvailability,
} from "@/domain/fishing-permits/get-prototype-permit-availability";

export type PaymentOutcome = "approved" | "cancelled" | "failed";
export type CheckoutStep = "buyer" | "requirements" | "review" | "confirmation";

function todayInNorway() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

export function usePermitCheckoutController({
  product,
  save,
  savePurchase,
  onPurchased,
}: {
  product: PrototypePermitProduct;
  save: (document: FishingDocument) => Promise<OperationResult<void>>;
  savePurchase: (purchase: PermitPurchase) => OperationResult<void>;
  onPurchased?: (zoneId: PrototypePermitProduct["zoneId"]) => void;
}) {
  const [step, setStep] = useState<CheckoutStep>("buyer");
  const [selectedDate, setSelectedDate] = useState(todayInNorway);
  const [form, setForm] = useState<PermitCheckoutForm>(emptyPermitCheckoutForm);
  const [outcome, setOutcome] = useState<PaymentOutcome>("approved");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{
    document: FishingDocument;
    purchase: PermitPurchase;
  } | null>(null);

  function updateForm<Key extends keyof PermitCheckoutForm>(
    key: Key,
    value: PermitCheckoutForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
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
    setStep("requirements");
  }

  function continueFromRequirements() {
    const participantError = validatePermitParticipants(product, form);
    if (participantError) return setError(participantError);
    setError("");
    setStep("review");
  }

  async function submit() {
    if (!canPurchasePrototypePermit(product))
      return setError("Dette kortet kan ikke kjøpes før prisen er bekreftet hos selger.");
    if (!form.confirmsDetails) return setError("Bekreft at opplysningene er riktige.");
    const availability = getPrototypePermitAvailability(product, selectedDate);
    if (!canSelectPrototypePermit(availability)) return setError(availability.label);
    setIsSubmitting(true);
    const now = Date.now();
    const purchaseId = `permit-purchase-${crypto.randomUUID()}`;
    const orderNumber = `EF-${String(now).slice(-8)}`;
    const paymentReference = `EF-TEST-${now}`;
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
      priceNok: product.price.amountNok,
      fishingDate: selectedDate,
      acceptedRulesAt: now,
      acceptedTermsAt: now,
      createdAt: now,
      status: outcome === "approved" ? "payment-approved" : outcome,
      termsVersion: permitTermsVersion,
      issuer: prototypePermitIssuer,
    };
    if (outcome !== "approved") {
      const purchase: PermitPurchase = {
        ...basePurchase,
        status: outcome,
        ...(outcome === "cancelled" ? { cancelledAt: now } : {}),
      };
      const stored = savePurchase(purchase);
      setIsSubmitting(false);
      if (!stored.ok) return setError(stored.error);
      return setError(
        outcome === "cancelled"
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
    setReceipt({ document, purchase: completedPurchase });
    setError("");
    setStep("confirmation");
    onPurchased?.(product.zoneId);
  }

  return {
    step,
    selectedDate,
    setSelectedDate: (value: string) => {
      setSelectedDate(value);
      setError("");
    },
    form,
    updateForm,
    outcome,
    setOutcome: (value: PaymentOutcome) => {
      setOutcome(value);
      setError("");
    },
    error,
    isSubmitting,
    receipt,
    continueFromBuyer,
    continueFromRequirements,
    submit,
    backTo: (target: CheckoutStep) => {
      setError("");
      setStep(target);
    },
  };
}
