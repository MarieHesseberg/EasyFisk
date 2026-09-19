import { appClockStart, appClockStorageKey } from "../data/prototype/demo-clock";
import { afterEach, expect, test, vi } from "vitest";
import { getAppNow, getAppDate } from "../domain/shared/app-clock";
import { getPrototypePermitAvailability } from "../domain/fishing-permits/get-prototype-permit-availability";
import { prototypePermitCatalogRepository as permitCatalogRepository } from "../data/prototype/prototype-permit-catalog-repository";
import { isFishingDocument, validateDocument } from "../domain/documents/validate-document";

afterEach(() => vi.useRealTimers());

test("one clock continues across reloads and is independent of the real season", () => {
  vi.useFakeTimers();
  const realStart = Date.parse("2027-01-10T10:00:00Z");
  vi.setSystemTime(realStart);
  localStorage.setItem(appClockStorageKey, String(realStart));
  expect(getAppNow()).toBe(appClockStart);
  expect(getAppDate()).toBe("2026-08-20");
  vi.setSystemTime(realStart + 90_000);
  expect(getAppNow()).toBe(appClockStart + 90_000);
});

test("past dates and closed sales cannot be purchased; season cards remain purchasable during season", () => {
  const products = permitCatalogRepository.listProducts();
  const daily = products.find((p) => p.zoneId === 3 && p.type === "day")!;
  const season = products.find((p) => p.zoneId === 3 && p.type === "season")!;
  expect(getPrototypePermitAvailability(daily, "2026-08-19", "no", appClockStart).status).toBe(
    "no-fishing-date",
  );
  expect(getPrototypePermitAvailability(daily, "2026-08-20", "no", appClockStart).status).toBe(
    "available",
  );
  expect(getPrototypePermitAvailability(season, "2026-08-20", "no", appClockStart).status).not.toBe(
    "no-fishing-date",
  );
  expect(
    getPrototypePermitAvailability(daily, "2026-08-30", "no", Date.parse("2026-08-27T12:00:00Z"))
      .status,
  ).toBe("not-on-sale");
});

test("moving the clock back preserves existing documents but rejects newly entered future dates", () => {
  const values = {
    holder: "Test Fisker",
    issuer: "Stasjon",
    performedAt: "2026-09-17T12:00",
    equipment: "Vadere",
  };
  expect(validateDocument("disinfection", values)).toContain("fremtiden");
  expect(
    isFishingDocument({
      id: "existing",
      kind: "disinfection",
      values,
      updatedAt: Date.parse("2026-09-17"),
    }),
  ).toBe(true);
});
