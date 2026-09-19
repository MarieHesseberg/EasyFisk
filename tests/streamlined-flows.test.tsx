import { expect, test } from "vitest";
import { calculatePersonalStatistics } from "../domain/statistics/calculate-personal-statistics";
import { correctCatchRecord } from "../domain/catches/correct-catch";
import { createLocalStorageFishingLogRepository } from "../data/local-storage/create-local-storage-fishing-log-repository";
import { getFishingStartQuotaStatus } from "../domain/quotas/get-fishing-start-quota-status";
import { getPrototypePermitAvailability } from "../domain/fishing-permits/get-prototype-permit-availability";
import { prototypePermitCatalogRepository as permitCatalogRepository } from "../data/prototype/prototype-permit-catalog-repository";
import type { CatchRecord } from "../domain/catches/catch";
import type { PermitPurchase } from "../domain/fishing-permits/permit-purchase";
const now = Date.parse("2026-08-20T18:05:00+02:00");
const record: CatchRecord = {
  id: "catch-edit",
  caughtAt: now,
  submittedAt: now,
  sessionStart: now - 60000,
  species: "Laks",
  result: "Avlivet",
  length: 60,
  weight: 3,
  zone: "Sone 3",
  violation: false,
  late: false,
};
test("corrections update quotas and preserve the original values after reload", () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
  };
  const repository = createLocalStorageFishingLogRepository(storage);
  repository.saveCatch(record);
  expect(getFishingStartQuotaStatus(repository.listCatches(), now).killedToday).toBe(1);
  expect(
    repository.updateCatchCorrection(record.id, {
      values: { species: "Laks", result: "Gjenutsatt", length: 65, weight: 3.2 },
      reason: "Valgte feil resultat",
    }).ok,
  ).toBe(true);
  const restored = createLocalStorageFishingLogRepository(storage).listCatches();
  expect(restored[0].weight).toBe(3.2);
  expect(restored[0].revisions?.[0].before.result).toBe("Avlivet");
  expect(restored[0].revisions?.[0].after.result).toBe("Gjenutsatt");
  expect(getFishingStartQuotaStatus(restored, now).killedToday).toBe(0);
  expect(getFishingStartQuotaStatus(restored, now).releasedToday).toBe(1);
  expect(calculatePersonalStatistics(restored, [], now).killedCount).toBe(0);
  expect(calculatePersonalStatistics(restored, [], now).releasedCount).toBe(1);
  expect(restored[0].id).toBe(record.id);
  expect(restored[0].caughtAt).toBe(record.caughtAt);
});
test("invalid corrections cannot replace measurements", () => {
  expect(() =>
    correctCatchRecord(record, { values: { ...record, weight: NaN }, reason: "Feil i vekt" }),
  ).toThrow();
  expect(() =>
    correctCatchRecord(record, {
      values: { ...record, length: Infinity },
      reason: "Feil i lengde",
    }),
  ).toThrow();
});
test("capacity decreases only for overlapping purchases and is released by refund", () => {
  const product = {
    ...permitCatalogRepository.findProduct("zone-3-day")!,
    capacity: { permitsPerFishingDay: 5, label: "5 kort" },
  };
  let date = "2026-08-20";
  for (let day = 20; day <= 25; day++) {
    const d = `2026-08-${day}`;
    if ((getPrototypePermitAvailability(product, d, "no", now).remainingUnits ?? 0) > 0) {
      date = d;
      break;
    }
  }
  const initial = getPrototypePermitAvailability(product, date, "no", now).remainingUnits!;
  expect(initial).toBeGreaterThan(0);
  const purchase = {
    id: "order-1",
    productId: product.id,
    fishingDate: date,
    status: "completed",
  } as PermitPurchase;
  expect(getPrototypePermitAvailability(product, date, "no", now, [purchase]).remainingUnits).toBe(
    initial - 1,
  );
  expect(
    getPrototypePermitAvailability(product, date, "no", now, [purchase, purchase]).remainingUnits,
  ).toBe(initial - 1);
  for (const status of ["failed", "cancelled", "refunded"] as const)
    expect(
      getPrototypePermitAvailability(product, date, "no", now, [{ ...purchase, status }])
        .remainingUnits,
    ).toBe(initial);
  expect(
    getPrototypePermitAvailability(product, date, "no", now, [{ ...purchase, productId: "other" }])
      .remainingUnits,
  ).toBe(initial);
  const all = Array.from({ length: initial }, (_, index) => ({
    ...purchase,
    id: `order-${index}`,
  }));
  expect(getPrototypePermitAvailability(product, date, "no", now, all).status).toBe("sold-out");
});
