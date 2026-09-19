import assert from "node:assert/strict";
import test from "node:test";
import { createLocalStorageFishingLogRepository } from "../data/local-storage/create-local-storage-fishing-log-repository.ts";
import { createLocalStoragePermitPurchaseRepository } from "../data/local-storage/create-local-storage-permit-purchase-repository.ts";
import { createLocalStoragePermitReportingRepository } from "../data/local-storage/create-local-storage-permit-reporting-repository.ts";
import { encodeDocument, decodeDocument } from "../data/local-storage/stored-document.ts";
import { createSessionRecord } from "../domain/sessions/create-session-record.ts";
import { catchBelongsToSession } from "../domain/sessions/catch-belongs-to-session.ts";
import { getPermitZoneId } from "../domain/documents/get-permit-zones.ts";
import { calculatePersonalStatistics } from "../domain/statistics/calculate-personal-statistics.ts";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}
const purchase = {
  id: "order-1",
  orderNumber: "EF-1",
  productId: "product-1",
  documentIds: ["permit-1"],
  buyer: {
    fullName: "Buyer Test",
    birthDate: "1990-01-01",
    email: "buyer@example.no",
    phone: "12345678",
  },
  fisher: {
    fullName: "Fisher Test",
    birthDate: "1995-02-01",
    email: "fisher@example.no",
    phone: "87654321",
  },
  coFishers: [],
  fishingDate: "2026-08-20",
  fishingDates: ["2026-08-20"],
  priceNok: 350,
  status: "completed",
  createdAt: 1,
  termsVersion: "terms-1",
  rulesVersion: "rules-1",
  acceptedRulesAt: 1,
  acceptedTermsAt: 1,
  issuer: "Demo",
};
const reportDay = {
  id: "report-1",
  productId: "product-1",
  zoneId: 3,
  areaName: "Test",
  fishingDate: "2026-08-20",
  startsAt: "2026-08-20T18:00",
  endsAt: "2026-08-21T17:59",
  seasonPermitDocumentId: "permit-1",
  outcome: "pending",
  updatedAt: 1,
};
const catchRecord = {
  id: "catch-1",
  caughtAt: 2000,
  submittedAt: 3000,
  sessionStart: 1000,
  species: "Laks",
  result: "Gjenutsatt",
  length: 60,
  weight: 2,
  zone: "Sone 3",
  violation: false,
  late: false,
  rulesVersion: "old-rules",
  imageId: "image-1",
};

test("legacy purchase and reporting arrays migrate only on successful writes, without losing identities", () => {
  for (const [key, factory, record] of [
    ["easyfisk:permit-purchases:v1", createLocalStoragePermitPurchaseRepository, purchase],
    ["easyfisk:permit-reporting-days:v1", createLocalStoragePermitReportingRepository, reportDay],
  ]) {
    const storage = memoryStorage();
    const original = JSON.stringify([record]);
    storage.setItem(key, original);
    const repository = factory(storage);
    assert.deepEqual(repository.list().value, [record]);
    assert.equal(storage.getItem(key), original, "reading must not write migrations");
    assert.equal(repository.save(record).ok, true);
    assert.equal(JSON.parse(storage.getItem(key)).schemaVersion, 1);
    assert.deepEqual(factory(storage).list().value, [record]);
  }
});

test("future formats, duplicate IDs and invalid values fail without overwriting stored data", () => {
  const key = "easyfisk:permit-purchases:v1";
  const storage = memoryStorage();
  const repository = createLocalStoragePermitPurchaseRepository(storage);
  for (const value of [
    { schemaVersion: 99, records: [purchase] },
    [purchase, purchase],
    [{ ...purchase, fishingDate: "2026-02-30" }],
  ]) {
    const original = JSON.stringify(value);
    storage.setItem(key, original);
    assert.equal(repository.list().ok, false);
    assert.equal(repository.save(purchase).ok, false);
    assert.equal(storage.getItem(key), original);
  }
  storage.setItem(key, "[]");
  assert.equal(repository.save({ ...purchase, acceptedRulesAt: NaN }).ok, false);
  assert.equal(storage.getItem(key), "[]");
});

test("failed migration write leaves the old data usable", () => {
  const original = JSON.stringify([purchase]);
  const repository = createLocalStoragePermitPurchaseRepository({
    getItem: () => original,
    setItem: () => {
      throw new Error("quota");
    },
  });
  assert.equal(repository.save({ ...purchase, status: "refunded" }).ok, false);
  assert.deepEqual(repository.list().value, [purchase]);
});

test("old fishing logs retain IDs, rule history and image references when upgraded", () => {
  const storage = memoryStorage();
  const key = "easyfisk:fishing-log:v1";
  const legacySession = { start: 1000, end: 3000, duration: 2, zone: "Sone 3", result: "1 fangst" };
  storage.setItem(
    key,
    JSON.stringify({ version: 1, catches: [catchRecord], latestSession: legacySession }),
  );
  const repository = createLocalStorageFishingLogRepository(storage);
  const sessionId = repository.listSessions()[0].id;
  assert.equal(JSON.parse(storage.getItem(key)).version, 1);
  assert.equal(repository.updateCatchCorrection(catchRecord.id, "Historisk notat").ok, true);
  assert.equal(JSON.parse(storage.getItem(key)).version, 3);
  assert.equal(repository.listSessions()[0].id, sessionId);
  assert.equal(repository.listCatches()[0].rulesVersion, "old-rules");
  assert.equal(repository.listCatches()[0].imageId, "image-1");
  const before = storage.getItem(key);
  assert.equal(repository.saveCatch({ ...catchRecord, id: "invalid", weight: -5 }).ok, false);
  assert.equal(storage.getItem(key), before);
  assert.equal(
    repository.saveCompletedSession(
      { ...legacySession, id: "invalid-time", start: 3000, end: 1000 },
      [],
      true,
    ).ok,
    false,
  );
  assert.equal(storage.getItem(key), before);
  storage.setItem(key, JSON.stringify({ version: 99, catches: [], sessions: [] }));
  assert.throws(() => repository.listSessions());
  assert.equal(repository.saveCatch(catchRecord).ok, false);
});

test("record versions preserve document attachments and metadata and reject unknown versions", () => {
  const document = {
    id: "permit-1",
    kind: "permit",
    updatedAt: 1,
    zoneId: 3,
    productId: "product-1",
    rulesVersion: "rules-1",
    values: {
      holder: "Test Fisker",
      issuer: "Demo",
      category: "Døgnkort",
      area: "Et visningsnavn",
      startsAt: "2026-08-20T18:00",
      endsAt: "2026-08-21T17:59",
    },
    attachment: new Blob(["pdf content"], { type: "application/pdf" }),
    attachmentName: "permit.pdf",
  };
  assert.deepEqual(decodeDocument(document), document);
  assert.deepEqual(decodeDocument(encodeDocument(document)), document);
  assert.equal(decodeDocument(encodeDocument(document)).attachment, document.attachment);
  assert.equal(getPermitZoneId(document), 3, "identity does not depend on the displayed name");
  assert.throws(() => decodeDocument({ ...document, schemaVersion: 99 }));
  assert.throws(() => encodeDocument({ ...document, zoneId: 9 }));
  assert.throws(() => encodeDocument({ ...document, verification: { method: "server-approved" } }));
});

test("two sessions with identical times have independent IDs and catch counts", () => {
  const first = createSessionRecord(1000, 3000, "Sone 3", "1 fangst");
  const second = createSessionRecord(1000, 3000, "Sone 3", "Nullfangst");
  assert.notEqual(first.id, second.id);
  assert.equal(
    createSessionRecord(1000, 3000, "A translated label", "Nullfangst", undefined, "id", 4).zoneId,
    4,
  );
  const linked = { ...catchRecord, sessionId: first.id, zoneId: 3 };
  assert.equal(catchBelongsToSession(linked, first), true);
  assert.equal(catchBelongsToSession(linked, second), false);
  assert.equal(
    calculatePersonalStatistics([linked], [first, second], 3000).zeroCatchSessionCount,
    1,
  );
  assert.equal(
    catchBelongsToSession(catchRecord, first),
    true,
    "legacy timestamp references remain readable",
  );
});
