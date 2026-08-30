import type { ZoneId } from "@/domain/zones/zone";

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
  status: "verified" | "not-published";
};

export type PrototypePermitRequirements = {
  requiresNationalFishingFee: boolean;
  requiresDisinfection: boolean;
  requiresRuleAcceptance: boolean;
  requiresSeasonPermit?: boolean;
};

export type PrototypePermitSource = {
  url: string;
  checkedAt: string;
  status: "verified-public-source";
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
  note: string;
};
