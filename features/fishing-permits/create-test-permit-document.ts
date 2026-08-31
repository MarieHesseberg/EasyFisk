import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { calculatePermitValidity } from "@/domain/fishing-permits/calculate-permit-validity";
import type { PermitPurchaseMetadata } from "@/domain/fishing-permits/permit-purchase";

export const testPurchaseDocumentPrefix = "test-purchase-permit-";

const categories = {
  boat: "Annet",
  day: "Døgnkort",
  group: "Gruppekort",
  reporting: "Annet",
  season: "Sesongkort",
  week: "Ukekort",
} as const;

export function createTestPermitDocument(
  product: PrototypePermitProduct,
  selectedDate: string,
  now = Date.now(),
  purchase?: PermitPurchaseMetadata,
): FishingDocument {
  const { startsAt, endsAt } = calculatePermitValidity(product, selectedDate);
  return {
    id: `${testPurchaseDocumentPrefix}${product.id}-${now}`,
    kind: "permit",
    updatedAt: now,
    values: {
      holder: purchase?.buyer.fullName ?? "Prototypebruker",
      reference: `TEST-${product.id.toUpperCase()}-${now}`,
      issuer: "EasyFisk testkjøp – ikke eksternt verifisert",
      category: categories[product.type],
      area: `Mandalselva · Sone ${product.zoneId} · ${product.areaName}`,
      startsAt,
      endsAt,
    },
    purchase,
  };
}
