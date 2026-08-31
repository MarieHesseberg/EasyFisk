import type { FishingDocument } from "../documents/fishing-document.ts";
import { getPermitZoneId } from "../documents/get-permit-zones.ts";
import type { PrototypePermitProduct } from "./prototype-permit-product.ts";
import { calculatePermitValidity } from "./calculate-permit-validity.ts";

export type PermitReportingOutcome = "pending" | "catch" | "no-catch";

export const permitReportingOutcomeLabels: Record<PermitReportingOutcome, string> = {
  pending: "Rapporteres etter fiskedøgnet",
  catch: "Fangst skal registreres",
  "no-catch": "Nullfangst",
};

export type PermitReportingDay = {
  id: string;
  productId: string;
  zoneId: PrototypePermitProduct["zoneId"];
  areaName: string;
  fishingDate: string;
  startsAt: string;
  endsAt: string;
  seasonPermitDocumentId: string;
  outcome: PermitReportingOutcome;
  updatedAt: number;
};

function normalized(value: string) {
  return value.toLocaleLowerCase("nb-NO").replaceAll(/[^a-zæøå0-9]/g, "");
}

export function findQualifyingSeasonPermit(
  documents: FishingDocument[],
  product: PrototypePermitProduct,
  fishingDate: string,
) {
  let reportingPeriod;
  try {
    reportingPeriod = calculatePermitValidity(product, fishingDate);
  } catch {
    return undefined;
  }
  const areaName = normalized(product.areaName);
  return documents.find(
    (document) =>
      document.kind === "permit" &&
      document.values.category === "Sesongkort" &&
      getPermitZoneId(document) === product.zoneId &&
      normalized(document.values.area ?? "").includes(areaName) &&
      (document.values.startsAt ?? "") <= reportingPeriod.startsAt &&
      (document.values.endsAt ?? "") >= reportingPeriod.endsAt,
  );
}

export function createPermitReportingDay(
  product: PrototypePermitProduct,
  fishingDate: string,
  seasonPermitDocumentId: string,
  now = Date.now(),
): PermitReportingDay {
  if (product.action !== "register-reporting-day" || !product.requirements.requiresSeasonPermit)
    throw new TypeError("Produktet er ikke et rapporteringskort for sesongkort.");
  const validity = calculatePermitValidity(product, fishingDate);
  return {
    id: `reporting-day-${product.id}-${fishingDate}`,
    productId: product.id,
    zoneId: product.zoneId,
    areaName: product.areaName,
    fishingDate,
    startsAt: validity.startsAt,
    endsAt: validity.endsAt,
    seasonPermitDocumentId,
    outcome: "pending",
    updatedAt: now,
  };
}

export function isPermitReportingDay(value: unknown): value is PermitReportingDay {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.productId === "string" &&
    [1, 2, 3, 4].includes(Number(record.zoneId)) &&
    typeof record.areaName === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(record.fishingDate)) &&
    typeof record.startsAt === "string" &&
    typeof record.endsAt === "string" &&
    typeof record.seasonPermitDocumentId === "string" &&
    ["pending", "catch", "no-catch"].includes(String(record.outcome)) &&
    typeof record.updatedAt === "number" &&
    Number.isFinite(record.updatedAt)
  );
}
