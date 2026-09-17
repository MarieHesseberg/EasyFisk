import type { ZoneId } from "@/domain/zones/zone";
import { t, type AppLanguage } from "../../locales/index.ts";
import { formatNumber } from "../../lib/localization-format.ts";

export type PrototypePermitType = "day" | "week" | "season" | "boat" | "group" | "reporting";

export type PrototypePermitAction = "purchase" | "register-reporting-day";

export type PrototypePermitAvailabilityStatus =
  | "available"
  | "low"
  | "sold-out"
  | "not-on-sale"
  | "no-fishing-date";

export type PrototypePermitAvailability = {
  status: PrototypePermitAvailabilityStatus;
  label: string;
  remainingUnits: number | null;
};

export type PrototypePermitValidity = {
  label: string;
  startsAt?: string;
  endsAt?: string;
  seasonStartsOn?: string;
  seasonEndsOn?: string;
};

export type PrototypePermitCapacity = {
  label: string;
  permitsPerFishingDay?: number;
  permitsPerSeason?: number;
  maximumRods?: number;
  maximumFishers?: number;
};

export type PrototypePermitPrice = {
  amountNok: number | null;
  status: "verified" | "prototype-estimate" | "not-published";
};

export type PrototypePermitRequirements = {
  requiresNationalFishingFee: boolean;
  requiresDisinfection: boolean;
  requiresRuleAcceptance: boolean;
  requiresSeasonPermit?: boolean;
};

export type PrototypePermitSource = {
  url: string;
  priceUrl?: string;
  checkedAt: string;
  status: "verified-public-source";
};

export type PrototypePermitSeller = {
  organization: string;
  contactName: string;
  phone: string;
  email: string;
};

export type PrototypePermitProductDetails = {
  ageRule: string;
  equipmentAndFacilities: readonly string[];
  reportingRule: string;
};

export type PrototypePermitProduct = {
  id: string;
  zoneId: ZoneId;
  areaName: string;
  title: string;
  type: PrototypePermitType;
  action: PrototypePermitAction;
  availability: PrototypePermitAvailability;
  validity: PrototypePermitValidity;
  capacity: PrototypePermitCapacity;
  price: PrototypePermitPrice;
  requirements: PrototypePermitRequirements;
  source: PrototypePermitSource;
  seller: PrototypePermitSeller;
  note: string;
};

export function canPurchasePrototypePermit(product: PrototypePermitProduct) {
  return (
    product.action !== "purchase" ||
    (product.price.status !== "not-published" && product.price.amountNok !== null)
  );
}

export function formatPrototypePermitPrice(
  product: PrototypePermitProduct,
  language: AppLanguage = "no",
) {
  if (product.action === "register-reporting-day") return t(language, "permit.freeRegistration");
  if (product.price.amountNok === null) return t(language, "permit.priceUnavailable");
  const price = `${formatNumber(product.price.amountNok, language)} kr`;
  return product.price.status === "prototype-estimate"
    ? t(language, "permit.simulatedPrice", { price })
    : price;
}
