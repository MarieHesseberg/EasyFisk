import type { PermitReportingOutcome } from "@/domain/fishing-permits/permit-reporting-day";
import type { Dispatch, SetStateAction } from "react";
import type { ZoneId } from "@/domain/zones/zone";
import type { PermitCheckoutForm, PermitPurchase } from "@/domain/fishing-permits/permit-purchase";
import type { FishingDocument } from "@/domain/documents/fishing-document";
export type PermitReceipt = { document: FishingDocument; purchase: PermitPurchase };
export type PermitJourney = {
  selectedZone: ZoneId;
  selectedArea: string;
  selectedProductId: string | null;
  isProductActionOpen: boolean;
  selectedDate: string;
  drafts: Record<string, PermitCheckoutForm>;
  receipts: Record<string, PermitReceipt>;
  reportingDrafts: Record<string, PermitReportingOutcome>;
};
export type PermitJourneyProps = {
  journey?: PermitJourney;
  setJourney?: Dispatch<SetStateAction<PermitJourney>>;
  onZoneChange?: (zone: ZoneId) => void;
};
export function createPermitJourney(zone: ZoneId = 3): PermitJourney {
  return {
    selectedZone: zone,
    selectedArea: "all",
    selectedProductId: null,
    isProductActionOpen: false,
    selectedDate: new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date()),
    drafts: {},
    receipts: {},
    reportingDrafts: {},
  };
}
