import type { PrototypePermitProduct } from "./prototype-permit-product.ts";

export type PermitBuyer = {
  fullName: string;
  birthDate: string;
  email: string;
  phone: string;
};

export type PermitPurchaseMetadata = {
  productId: string;
  buyer: PermitBuyer;
  coFishers: string[];
  priceNok: number | null;
  fishingDate: string;
  acceptedRulesAt: number;
  acceptedTermsAt: number;
  paymentReference: string;
};

export type PermitCheckoutForm = PermitBuyer & {
  coFishersText: string;
  acceptsRules: boolean;
  acceptsTerms: boolean;
  confirmsDetails: boolean;
};

export const emptyPermitCheckoutForm: PermitCheckoutForm = {
  fullName: "",
  birthDate: "",
  email: "",
  phone: "",
  coFishersText: "",
  acceptsRules: false,
  acceptsTerms: false,
  confirmsDetails: false,
};

export function parseCoFishers(value: string) {
  return value
    .split("\n")
    .map((name) => name.trim())
    .filter(Boolean);
}

export function validatePermitBuyer(form: PermitCheckoutForm) {
  if (form.fullName.trim().length < 3) return "Oppgi fullt navn på kortinnehaveren.";
  const birthDate = Date.parse(`${form.birthDate}T12:00:00`);
  if (!Number.isFinite(birthDate) || birthDate > Date.now()) return "Oppgi en gyldig fødselsdato.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    return "Oppgi en gyldig e-postadresse.";
  if (form.phone.replaceAll(/\D/g, "").length < 8) return "Oppgi et gyldig telefonnummer.";
}

export function validatePermitParticipants(
  product: PrototypePermitProduct,
  form: PermitCheckoutForm,
) {
  const coFishers = parseCoFishers(form.coFishersText);
  if (product.type === "group" && coFishers.length === 0)
    return "Registrer minst én medfisker på gruppekortet.";
  if (product.capacity.maximumFishers && coFishers.length + 1 > product.capacity.maximumFishers)
    return `Kortet tillater maksimalt ${product.capacity.maximumFishers} fiskere.`;
  if (!form.acceptsRules) return "Bekreft at fiskereglene er lest og forstått.";
  if (!form.acceptsTerms) return "Godta vilkårene for testkjøpet.";
}

export function isPermitPurchaseMetadata(value: unknown): value is PermitPurchaseMetadata {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const buyer = record.buyer as Record<string, unknown> | undefined;
  return (
    typeof record.productId === "string" &&
    record.productId.length > 0 &&
    !!buyer &&
    typeof buyer.fullName === "string" &&
    buyer.fullName.length > 0 &&
    typeof buyer.birthDate === "string" &&
    typeof buyer.email === "string" &&
    typeof buyer.phone === "string" &&
    Array.isArray(record.coFishers) &&
    record.coFishers.every((name) => typeof name === "string" && name.length > 0) &&
    (record.priceNok === null ||
      (typeof record.priceNok === "number" && Number.isFinite(record.priceNok))) &&
    typeof record.fishingDate === "string" &&
    typeof record.acceptedRulesAt === "number" &&
    Number.isFinite(record.acceptedRulesAt) &&
    typeof record.acceptedTermsAt === "number" &&
    Number.isFinite(record.acceptedTermsAt) &&
    typeof record.paymentReference === "string" &&
    record.paymentReference.length > 0
  );
}
