import { expect, test } from "vitest";
import { additionalPermitProducts } from "../data/prototype/mandalselva-additional-permits";
import { prototypePermitProducts } from "../data/prototype/mandalselva-permit-products";
import { getPrototypePermitProductDetails } from "../data/prototype/mandalselva-permit-product-details";
import {
  getPrototypePermitAvailability,
  getPrototypePermitDateRange,
} from "../domain/fishing-permits/get-prototype-permit-availability";
import { createTestPermitDocument } from "../features/fishing-permits/create-test-permit-document";

test("new subzones have distinct purchase identities and traceable published prices", () => {
  expect(additionalPermitProducts).toHaveLength(27);
  expect(new Set(prototypePermitProducts.map((product) => product.id)).size).toBe(
    prototypePermitProducts.length,
  );
  for (const product of additionalPermitProducts) {
    expect(prototypePermitProducts).toContain(product);
    expect(product.price.status).toBe("verified");
    expect(product.price.amountNok).toBeGreaterThan(0);
    expect(new URL(product.source.url).hostname).toBe("www.inatur.no");
    expect(new URL(product.source.priceUrl!).hostname).toBe("www.scanatura.no");
    const document = createTestPermitDocument(product, "2026-07-15", 123);
    expect(document.values.area).toBe(`Mandalselva · Sone ${product.zoneId} · ${product.areaName}`);
    expect(document.values.startsAt).toContain("2026-07-15");
    expect(getPrototypePermitProductDetails(product).equipmentAndFacilities.length).toBeGreaterThan(
      0,
    );
  }
});

test("Bjåhylen and Nodehylen stop in August while other zone 4 areas allow September", () => {
  for (const product of additionalPermitProducts.filter((product) => product.zoneId === 4)) {
    const closesInAugust = ["Bjåhylen", "Nodehylen"].includes(product.areaName);
    expect(getPrototypePermitDateRange(product).endsOn).toBe(
      closesInAugust ? "2026-08-31" : "2026-09-15",
    );
    if (closesInAugust) {
      expect(createTestPermitDocument(product, "2026-08-31").values.endsAt).toBe(
        "2026-08-31T23:59",
      );
    }
    expect(getPrototypePermitAvailability(product, "2026-09-01").status === "no-fishing-date").toBe(
      closesInAugust,
    );
  }
});

test("important local conditions and the boat included at Holmesland B remain visible in details", () => {
  const find = (area: string) =>
    additionalPermitProducts.find((product) => product.areaName === area)!;
  expect(
    getPrototypePermitProductDetails(find("Holmesland B")).equipmentAndFacilities.join(" "),
  ).toContain("Båt er inkludert");
  expect(
    getPrototypePermitProductDetails(find("Nedre Nøding")).equipmentAndFacilities.join(" "),
  ).toContain("to fiskedøgn per person per uke");
  expect(
    getPrototypePermitProductDetails(find("Laksehylen")).equipmentAndFacilities.join(" "),
  ).toContain("50 meter");
  expect(find("Bringsdal A").price.amountNok).toBe(250);
  expect(find("Holmesland B").price.amountNok).toBe(375);
  expect(find("Steinshylen").price.amountNok).toBe(1000);
});
