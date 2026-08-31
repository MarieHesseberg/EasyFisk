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
} from "@/domain/fishing-permits/permit-purchase";
import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import type { OperationResult } from "@/domain/shared/operation-result";
import { createTestPermitDocument } from "./create-test-permit-document";

export type PaymentOutcome = "approved" | "cancelled" | "failed";
export type CheckoutStep = "buyer" | "requirements" | "review" | "confirmation";

function todayInNorway() {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

export function usePermitCheckoutController({
  product,
  save,
  onPurchased,
}: {
  product: PrototypePermitProduct;
  save: (document: FishingDocument) => Promise<OperationResult<void>>;
  onPurchased?: (zoneId: PrototypePermitProduct["zoneId"]) => void;
}) {
  const [step, setStep] = useState<CheckoutStep>("buyer");
  const [selectedDate, setSelectedDate] = useState(todayInNorway);
  const [form, setForm] = useState<PermitCheckoutForm>(emptyPermitCheckoutForm);
  const [outcome, setOutcome] = useState<PaymentOutcome>("approved");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<FishingDocument | null>(null);

  function updateForm<Key extends keyof PermitCheckoutForm>(
    key: Key,
    value: PermitCheckoutForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setError("");
  }

  function continueFromBuyer() {
    const buyerError = validatePermitBuyer(form);
    if (buyerError) return setError(buyerError);
    try {
      calculatePermitValidity(product, selectedDate);
    } catch {
      return setError("Velg en gyldig fiskedato for dette kortet.");
    }
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
    if (!form.confirmsDetails) return setError("Bekreft at opplysningene er riktige.");
    if (outcome === "cancelled") return setError("Betalingen ble avbrutt. Ingen kort ble lagret.");
    if (outcome === "failed") return setError("Testbetalingen feilet. Ingen kort ble lagret.");

    setIsSubmitting(true);
    const now = Date.now();
    const paymentReference = `EF-TEST-${now}`;
    const document = createTestPermitDocument(product, selectedDate, now, {
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
      paymentReference,
    });
    const result = await save(document);
    setIsSubmitting(false);
    if (!result.ok) return setError(result.error);
    setReceipt(document);
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
