import type { ZoneId } from "@/domain/zones/zone";

export type PrototypePermitType = "day" | "week" | "season" | "boat" | "reporting";

export type PrototypePermitProduct = {
  id: string;
  zoneId: ZoneId;
  areaName: string;
  title: string;
  type: PrototypePermitType;
  validityLabel: string;
  capacityLabel: string;
  priceNok: number | null;
  sourceUrl: string;
  sourceCheckedAt: string;
  isPurchasable: boolean;
  note: string;
};
