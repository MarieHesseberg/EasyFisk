import type { PrototypePermitProduct } from "@/domain/fishing-permits/prototype-permit-product";
import type { FishingDocument } from "@/domain/documents/fishing-document";

export const testPurchaseDocumentPrefix = "test-purchase-permit-";

const categories = {
  boat: "Annet",
  day: "Døgnkort",
  reporting: "Annet",
  season: "Sesongkort",
  week: "Ukekort",
} as const;

function toLocalDateTime(timestamp: number) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .format(timestamp)
    .replace(" ", "T");
}

export function createTestPermitDocument(
  product: PrototypePermitProduct,
  now = Date.now(),
): FishingDocument {
  const duration = product.type === "season" ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return {
    id: `${testPurchaseDocumentPrefix}${product.id}-${now}`,
    kind: "permit",
    updatedAt: now,
    values: {
      holder: "Prototypebruker",
      reference: `TEST-${product.id.toUpperCase()}-${now}`,
      issuer: "EasyFisk testkjøp – ikke eksternt verifisert",
      category: categories[product.type],
      area: `Mandalselva · ${product.areaName}`,
      startsAt: toLocalDateTime(now - 60_000),
      endsAt: toLocalDateTime(now + duration),
    },
  };
}
