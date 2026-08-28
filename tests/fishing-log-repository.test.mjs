import assert from "node:assert/strict";
import test from "node:test";

import { createMemoryFishingLogRepository } from "../data/memory/create-memory-fishing-log-repository.ts";

const session = {
  start: 1_000,
  end: 4_000,
  duration: 3,
  zone: "Sone 3 · Øyslebø–Laudal",
  result: "Nullfangst registrert",
};

const catchRecord = {
  id: "ME-1",
  caughtAt: 2_000,
  submittedAt: 2_100,
  sessionStart: 1_000,
  species: "Laks",
  result: "Gjenutsatt",
  length: 70,
  weight: 4,
  zone: "Sone 3 · Øyslebø–Laudal",
  violation: false,
  late: false,
};

test("minnelager lagrer økt og fangst gjennom samme kontrakt", () => {
  const repository = createMemoryFishingLogRepository();

  repository.saveSession(session);
  repository.saveCatch(catchRecord);

  assert.deepEqual(repository.getLatestSession(), session);
  assert.deepEqual(repository.listCatches(), [catchRecord]);
});

test("minnelager beskytter den interne listen mot direkte endring", () => {
  const repository = createMemoryFishingLogRepository({ catches: [catchRecord] });
  const result = repository.listCatches();

  result.length = 0;

  assert.equal(repository.listCatches().length, 1);
});

test("fangstkorrigering oppdaterer bare valgt fangst", () => {
  const secondCatch = { ...catchRecord, id: "ME-2" };
  const repository = createMemoryFishingLogRepository({ catches: [catchRecord, secondCatch] });

  repository.updateCatchCorrection("ME-2", "Kontrollert mot originalrapport");

  assert.equal(repository.listCatches()[0].correction, undefined);
  assert.equal(repository.listCatches()[1].correction, "Kontrollert mot originalrapport");
});

test("ferdig økt lagres samlet med fangster og avslutter aktiv økt", () => {
  const repository = createMemoryFishingLogRepository({
    activeSession: { startTime: 1_000, zone: 3 },
  });

  const result = repository.saveCompletedSession(session, [catchRecord], true);

  assert.equal(result.ok, true);
  assert.deepEqual(repository.getLatestSession(), session);
  assert.deepEqual(repository.listCatches(), [catchRecord]);
  assert.equal(repository.getActiveSession(), null);
});
