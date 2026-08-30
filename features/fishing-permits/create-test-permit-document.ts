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
  selectedDate: string,
  now = Date.now(),
): FishingDocument {
  const startsAt = `${selectedDate}T00:00`;
  const selectedDay = new Date(`${selectedDate}T12:00:00`);
  const seasonEnd = new Date(selectedDay.getTime() + 30 * 24 * 60 * 60 * 1000);
  const endsAt =
    product.type === "season"
      ? `${toLocalDateTime(seasonEnd.getTime()).slice(0, 10)}T23:59`
      : `${selectedDate}T23:59`;
  return {
    id: `${testPurchaseDocumentPrefix}${product.id}-${now}`,
    kind: "permit",
    updatedAt: now,
    values: {
      holder: "Prototypebruker",
      reference: `TEST-${product.id.toUpperCase()}-${now}`,
      issuer: "EasyFisk testkjøp – ikke eksternt verifisert",
      category: categories[product.type],
      area: `Mandalselva · Sone ${product.zoneId} · ${product.areaName}`,
      startsAt,
      endsAt,
    },
  };
}
