import type { PrototypePermitProduct } from "./prototype-permit-product.ts";

export const permitTermsVersion = "easyfisk-prototype-2026-08-31";
export const prototypePermitIssuer = "EasyFisk testbutikk";
export type PrototypePaymentOutcome = "approved" | "cancelled" | "failed";

export type PermitBuyer = { fullName: string; birthDate: string; email: string; phone: string };
export type PermitPurchaseStatus =
  | "payment-approved"
  | "completed"
  | "cancelled"
  | "failed"
  | "issuance-failed"
  | "refunded";
export type PermitPurchase = {
  id: string;
  orderNumber: string;
  productId: string;
  documentId?: string;
  buyer: PermitBuyer;
  coFishers: string[];
  fishingDate: string;
  priceNok: number | null;
  status: PermitPurchaseStatus;
  createdAt: number;
  paidAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  refundedAt?: number;
  refundReason?: string;
  termsVersion: string;
  acceptedRulesAt: number;
  acceptedTermsAt: number;
  paymentReference?: string;
  issuer: string;
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
export function isPermitPurchase(value: unknown): value is PermitPurchase {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  const buyer = record.buyer as Record<string, unknown> | undefined;
  const statuses: PermitPurchaseStatus[] = [
    "payment-approved",
    "completed",
    "cancelled",
    "failed",
    "issuance-failed",
    "refunded",
  ];
  const optionalNumber = (field: unknown) =>
    field === undefined || (typeof field === "number" && Number.isFinite(field));
  const optionalString = (field: unknown) => field === undefined || typeof field === "string";
  return (
    typeof record.id === "string" &&
    record.id.length > 0 &&
    typeof record.orderNumber === "string" &&
    record.orderNumber.length > 0 &&
    typeof record.productId === "string" &&
    record.productId.length > 0 &&
    optionalString(record.documentId) &&
    !!buyer &&
    typeof buyer.fullName === "string" &&
    typeof buyer.birthDate === "string" &&
    typeof buyer.email === "string" &&
    typeof buyer.phone === "string" &&
    Array.isArray(record.coFishers) &&
    record.coFishers.every((name) => typeof name === "string") &&
    typeof record.fishingDate === "string" &&
    (record.priceNok === null ||
      (typeof record.priceNok === "number" && Number.isFinite(record.priceNok))) &&
    statuses.includes(record.status as PermitPurchaseStatus) &&
    typeof record.createdAt === "number" &&
    Number.isFinite(record.createdAt) &&
    optionalNumber(record.paidAt) &&
    optionalNumber(record.completedAt) &&
    optionalNumber(record.cancelledAt) &&
    optionalNumber(record.refundedAt) &&
    optionalString(record.refundReason) &&
    typeof record.termsVersion === "string" &&
    typeof record.acceptedRulesAt === "number" &&
    typeof record.acceptedTermsAt === "number" &&
    optionalString(record.paymentReference) &&
    typeof record.issuer === "string" &&
    record.issuer.length > 0
  );
}
