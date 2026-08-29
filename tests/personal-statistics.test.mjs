import assert from "node:assert/strict";
import test from "node:test";

import { calculatePersonalStatistics } from "../domain/statistics/calculate-personal-statistics.ts";

const firstSessionStart = Date.parse("2026-07-10T08:00:00+02:00");
const secondSessionStart = Date.parse("2026-07-11T08:00:00+02:00");

const sessions = [
  {
    id: "EF-OKT-1",
    start: firstSessionStart,
    end: firstSessionStart + 18_000_000,
    duration: 18_000,
    zone: "Sone 1",
    result: "2 fangster",
  },
  {
    id: "EF-OKT-2",
    start: secondSessionStart,
    end: secondSessionStart + 18_000_000,
    duration: 18_000,
    zone: "Sone 2",
    result: "Nullfangst",
  },
];

function createCatch(overrides = {}) {
  return {
    id: "EF-FANGST-1",
    caughtAt: Date.parse("2026-07-10T10:00:00+02:00"),
    submittedAt: Date.parse("2026-07-10T10:10:00+02:00"),
    sessionStart: firstSessionStart,
    species: "Laks",
    result: "Avlivet",
    length: 60,
    weight: 3,
    zone: "Sone 1",
    violation: false,
    late: false,
    ...overrides,
  };
}

test("personlig historikk beregnes fra lokale økter og fangster", () => {
  const catches = [
    createCatch(),
    createCatch({ id: "EF-FANGST-2", species: "Sjøørret", result: "Gjenutsatt" }),
  ];
  const statistics = calculatePersonalStatistics(
    catches,
    sessions,
    Date.parse("2026-07-10T12:00:00+02:00"),
  );

  assert.equal(statistics.sessionCount, 2);
  assert.equal(statistics.fishingSeconds, 36_000);
  assert.equal(statistics.catchCount, 2);
  assert.equal(statistics.zeroCatchSessionCount, 1);
  assert.equal(statistics.killedCount, 1);
  assert.equal(statistics.releasedCount, 1);
  assert.equal(statistics.salmonCount, 1);
  assert.equal(statistics.seaTroutCount, 1);
  assert.equal(statistics.catchesPerTenHours, 2);
});

test("sesongkvoten ignorerer eldre fangster, mens historikken beholder dem", () => {
  const catches = [
    createCatch(),
    createCatch({ id: "EF-FANGST-2025", caughtAt: Date.parse("2025-07-10T10:00:00+02:00") }),
  ];
  const statistics = calculatePersonalStatistics(
    catches,
    sessions,
    Date.parse("2026-07-10T12:00:00+02:00"),
  );

  assert.equal(statistics.catchCount, 2);
  assert.equal(statistics.killedSalmonQuota.usedThisSeason, 1);
  assert.equal(statistics.killedSalmonQuota.remainingThisSeason, 4);
});

test("døgnkvoten bruker norsk dato rundt midnatt", () => {
  const catches = [
    createCatch({ caughtAt: Date.parse("2026-07-10T22:30:00Z") }),
    createCatch({ id: "EF-FANGST-2", caughtAt: Date.parse("2026-07-10T21:30:00Z") }),
  ];
  const statistics = calculatePersonalStatistics(
    catches,
    sessions,
    Date.parse("2026-07-10T22:45:00Z"),
  );

  assert.equal(statistics.killedSalmonQuota.usedToday, 1);
  assert.equal(statistics.killedSalmonQuota.remainingToday, 0);
});

test("tom lokalhistorikk gir trygge nullverdier", () => {
  const statistics = calculatePersonalStatistics([], [], Date.parse("2026-07-10T12:00:00Z"));

  assert.equal(statistics.sessionCount, 0);
  assert.equal(statistics.fishingSeconds, 0);
  assert.equal(statistics.catchCount, 0);
  assert.equal(statistics.catchesPerTenHours, 0);
  assert.equal(statistics.killedSalmonQuota.remainingThisSeason, 5);
  assert.equal(statistics.releasedSalmonQuota.remainingThisSeason, 20);
});
