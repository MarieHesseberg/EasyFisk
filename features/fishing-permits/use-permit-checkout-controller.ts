"use client";
import { useAppServices } from "@/data/runtime/services-provider";
import {
  acceptCurrentRules,
  hasAcceptedCurrentRules,
  currentRuleVersion,
} from "@/application/rules/rule-acceptance";
import { readProfile } from "@/features/profile/local-profile";
import { getAppNow, getAppDate } from "@/domain/shared/app-clock";

import type { PermitReceipt } from "./permit-journey";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
import { useDraft, useDraftState } from "@/hooks/use-draft";
import { useRef, useState, useEffect } from "react";
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
  saveMany,
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
  saveMany?: (documents: FishingDocument[]) => Promise<OperationResult<void>>;
  savePurchase: (
    purchase: PermitPurchase,
  ) => OperationResult<void> | Promise<OperationResult<void>>;
  onPurchased?: (zoneId: PrototypePermitProduct["zoneId"]) => void;
  paymentOutcome: PrototypePaymentOutcome;
  initialSelectedDate?: string;
  initialForm?: PermitCheckoutForm;
  onFormChange?: (form: PermitCheckoutForm) => void;
  initialReceipt?: PermitReceipt;
  onReceipt?: (receipt: PermitReceipt) => void;
}) {
  const services = useAppServices();
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
      ? { ...emptyPermitCheckoutForm, ...readProfile(), acceptsRules: hasAcceptedCurrentRules() }
      : (initialForm ?? {
          ...emptyPermitCheckoutForm,
          ...readProfile(),
          acceptsRules: hasAcceptedCurrentRules(),
        }),
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<{
    document: FishingDocument;
    purchase: PermitPurchase;
  } | null>(initialReceipt ?? null);
  const submissionLock = useRef(false);
  const validationRequest = useRef(0);
  useEffect(
    () => () => {
      validationRequest.current += 1;
    },
    [],
  );
  const [attempt, setAttempt] = useDraftState<{ key: string; now: number; id: string } | null>(
    "purchaseAttempt",
    null,
  );

  const fishingDates =
    product.type === "day"
      ? [...new Set([selectedDate, ...(form.fishingDates ?? [])])].sort()
      : [selectedDate];
  const pricedForm = { ...form, fishingDates };
  async function currentAvailability() {
    const result = await services.purchases.list();
    if (!result.ok)
      return { status: "not-on-sale" as const, label: result.error, remainingUnits: 0 };
    const results = fishingDates.map((date) =>
      getPrototypePermitAvailability(
        product,
        date,
        language,
        undefined,
        result.value.filter(
          (purchase) =>
            purchase.id !==
            (attempt?.key === JSON.stringify([product.id, selectedDate, form])
              ? attempt.id
              : undefined),
        ),
      ),
    );
    const index = results.findIndex((result) => !canSelectPrototypePermit(result));
    return index < 0
      ? results[0]
      : { ...results[index], label: `${fishingDates[index]}: ${results[index].label}` };
  }
  function updateForm<Key extends keyof PermitCheckoutForm>(
    key: Key,
    value: PermitCheckoutForm[Key],
  ) {
    validationRequest.current += 1;
    const updated = { ...form, [key]: value };
    setForm(updated);
    onFormChange?.(updated);
    setError("");
  }

  async function continueFromBuyer() {
    const request = ++validationRequest.current;
    if (!canPurchasePrototypePermit(product))
      return setError("Dette kortet kan ikke kjøpes før prisen er bekreftet hos selger.");
    const buyerError = validatePermitBuyer(form);
    if (buyerError) return setError(buyerError);
    try {
      calculatePermitValidity(product, selectedDate);
    } catch {
      return setError("Velg en gyldig fiskedato for dette kortet.");
    }
    let availability;
    try {
      availability = await currentAvailability();
    } catch {
      return setError("Kunne ikke hente tilgjengelighet. Prøv igjen.");
    }
    if (request !== validationRequest.current) return;
    if (!canSelectPrototypePermit(availability)) return setError(availability.label);
    setError("");
    const participantError = validatePermitParticipants(product, {
      ...form,
      acceptsRules: form.acceptsRules || hasAcceptedCurrentRules(),
    });
    if (participantError) return setError(participantError);
    setStep("payment");
  }

  function paymentError(message: string) {
    setStep("buyer");
    setError(message);
  }

  async function submit() {
    if (submissionLock.current || receipt) return;
    if (services.mode !== "demo")
      return paymentError("Testbetaling er bare tilgjengelig i demonstrasjonsmodus.");
    const validationError =
      validatePermitBuyer(form) ||
      validatePermitParticipants(product, {
        ...form,
        acceptsRules: form.acceptsRules || hasAcceptedCurrentRules(),
      });
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
    submissionLock.current = true;
    setIsSubmitting(true);
    try {
      const availability = await currentAvailability();
      if (!canSelectPrototypePermit(availability)) return paymentError(availability.label);
      const key = JSON.stringify([product.id, selectedDate, form]);
      const currentAttempt =
        attempt?.key === key
          ? attempt
          : { key, now: getAppNow(), id: `permit-purchase-${createLocalId()}` };
      setAttempt(currentAttempt);
      const { now, id: purchaseId } = currentAttempt;
      const orderNumber = `EF-${String(now).slice(-8)}`;
      const paymentReference = `EF-TEST-${now}`;
      const price = getPermitPriceSummary(product, pricedForm);
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
        fishingDates,
        ...(form.buyForOther ? { fisher: form.fisher } : {}),
        rulesVersion: currentRuleVersion,
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
        const stored = await savePurchase(purchase);
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
      const purchaseStored = await savePurchase(approvedPurchase);
      if (!purchaseStored.ok) {
        setIsSubmitting(false);
        return paymentError(purchaseStored.error);
      }
      const issuedDocuments = fishingDates.map((date, index) =>
        createTestPermitDocument(product, date, now + index, approvedPurchase),
      );
      if (saveMany) {
        const result = await saveMany(issuedDocuments);
        if (!result.ok) {
          await savePurchase({ ...approvedPurchase, status: "issuance-failed" });
          return paymentError(result.error);
        }
      } else
        for (const issuedDocument of issuedDocuments) {
          const result = await save(issuedDocument);
          if (!result.ok) {
            await savePurchase({ ...approvedPurchase, status: "issuance-failed" });
            return paymentError(result.error);
          }
        }
      const document = issuedDocuments[0];
      acceptCurrentRules();
      setIsSubmitting(false);
      const completedPurchase: PermitPurchase = {
        ...approvedPurchase,
        status: "completed",
        documentId: document.id,
        documentIds: issuedDocuments.map((item) => item.id),
        completedAt: getAppNow(),
      };
      const completed = await savePurchase(completedPurchase);
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
    form: pricedForm,
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
      validationRequest.current += 1;
      setError("");
      setStep(target);
    },
  };
}
