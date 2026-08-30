import assert from "node:assert/strict";
import test from "node:test";

import { isReportLate, reportingDeadlineMs } from "../domain/catches/reporting-deadline.ts";
import { parseMeasurement, validateCatch } from "../domain/catches/validate-catch.ts";
import { getStatusResolution, statusState } from "../domain/fishing-rules/status-checks.ts";
import { activeFishingRules } from "../domain/fishing-rules/mandalselva-2026.ts";
import {
  countKilledSalmonForDay,
  getNorwegianCalendarDate,
  getQuotaStatus,
} from "../domain/quotas/get-quota-status.ts";
import {
  elapsedSeconds,
  isCatchWithinSession,
  isValidSessionTime,
} from "../domain/sessions/session-timing.ts";
import {
  getSubzones,
  getZoneSeasonEnd,
  isDateWithinZoneSeason,
} from "../domain/zones/zone-rules.ts";

test("fangstmål leses med både komma og punktum", () => {
  assert.equal(parseMeasurement("64,5"), 64.5);
  assert.equal(parseMeasurement("2.4"), 2.4);
});

test("fangstvalidering håndhever minste- og maksimumsmål", () => {
  assert.equal(validateCatch("Laks", "Avlivet", 34.9, 2).blocked, true);
  assert.equal(validateCatch("Laks", "Avlivet", 35, 2).blocked, false);
  assert.equal(validateCatch("Laks", "Avlivet", 90, 8).largeSalmon, true);
  assert.equal(validateCatch("Laks", "Avlivet", 90.1, 8).tooLarge, true);
  assert.equal(validateCatch("Sjøørret", "Gjenutsatt", 20, 1).blocked, false);
});

test("rapporteringsfristen er to timer med korrekt grense", () => {
  const caughtAt = 1_000;
  assert.equal(isReportLate(caughtAt, caughtAt + reportingDeadlineMs), false);
  assert.equal(isReportLate(caughtAt, caughtAt + reportingDeadlineMs + 1), true);
});

test("kvotestatus teller bare avlivet laks", () => {
  const existing = [
    { species: "Laks", result: "Avlivet", caughtAt: Date.parse("2026-07-01T12:00:00Z") },
    { species: "Sjøørret", result: "Avlivet", caughtAt: Date.parse("2026-07-01T12:00:00Z") },
  ];
  const session = [
    { species: "Laks", result: "Avlivet", caughtAt: Date.parse("2026-07-01T12:00:00Z") },
    { species: "Laks", result: "Gjenutsatt", caughtAt: Date.parse("2026-07-01T12:00:00Z") },
  ];

  assert.deepEqual(getQuotaStatus(existing, session, 4), {
    killedBefore: 1,
    killedInSession: 1,
    remaining: 2,
    seasonAvailable: true,
    dailyValid: true,
  });
  assert.equal(
    getQuotaStatus(
      existing,
      [
        ...session,
        { species: "Laks", result: "Avlivet", caughtAt: Date.parse("2026-07-01T13:00:00Z") },
      ],
      4,
    ).dailyValid,
    false,
  );
});

test("sesongkvoten ignorerer fangster utenfor aktiv sesong", () => {
  const catches = [
    { species: "Laks", result: "Avlivet", caughtAt: Date.parse("2025-07-01T12:00:00Z") },
    { species: "Laks", result: "Avlivet", caughtAt: Date.parse("2026-07-01T12:00:00Z") },
    { species: "Laks", result: "Avlivet", caughtAt: Date.parse("2026-09-16T12:00:00Z") },
  ];

  assert.equal(getQuotaStatus(catches, [], 5).killedBefore, 1);
});

test("fangstdato bruker norsk tid rundt midnatt", () => {
  const afterNorwegianMidnight = Date.parse("2026-06-10T22:30:00Z");

  assert.equal(getNorwegianCalendarDate(afterNorwegianMidnight), "2026-06-11");
  assert.equal(
    countKilledSalmonForDay(
      [{ species: "Laks", result: "Avlivet", caughtAt: afterNorwegianMidnight }],
      "2026-06-11",
    ),
    1,
  );
});

test("døgnkvote teller bare avlivet laks på valgt fangstdato", () => {
  const firstDay = Date.parse("2026-06-10T12:00:00Z");
  const secondDay = Date.parse("2026-06-11T12:00:00Z");
  const catches = [
    { species: "Laks", result: "Avlivet", caughtAt: firstDay },
    { species: "Laks", result: "Gjenutsatt", caughtAt: firstDay },
    { species: "Laks", result: "Avlivet", caughtAt: secondDay },
  ];

  assert.equal(countKilledSalmonForDay(catches, "2026-06-10"), 1);
});

test("økttid håndterer varighet og grenseverdier", () => {
  assert.equal(elapsedSeconds(1_000, 4_999), 3);
  assert.equal(elapsedSeconds(5_000, 1_000), 0);
  assert.equal(isValidSessionTime(1_000, 2_000, 2_000), true);
  assert.equal(isValidSessionTime(2_000, 1_000, 3_000), false);
  assert.equal(isCatchWithinSession(1_000, 1_000, 2_000), true);
  assert.equal(isCatchWithinSession(2_001, 1_000, 2_000), false);
});

test("soneregler definerer sesong og delsoner", () => {
  assert.equal(getZoneSeasonEnd(3), "2026-08-31");
  assert.equal(getZoneSeasonEnd(4), "2026-09-15");
  assert.equal(getZoneSeasonEnd(4, "Bjåhylen"), "2026-08-31");
  assert.equal(isDateWithinZoneSeason("2026-06-01", 3), true);
  assert.equal(isDateWithinZoneSeason("2026-09-01", 3), false);
  assert.equal(isDateWithinZoneSeason("2026-09-01", 4, "Bjåhylen"), false);
  assert.equal(getSubzones(2).length, 33);
  assert.deepEqual(getSubzones(4), [
    "Strædethylen",
    "Bjåhylen",
    "Laksehylen",
    "Steinshylen",
    "Klevelandsfossen",
    "Nodehylen",
  ]);
});

test("aktivt regelgrunnlag samler versjon, sesong, størrelser og kvoter", () => {
  assert.equal(activeFishingRules.metadata.versionDate, "2026-08-01");
  assert.equal(activeFishingRules.season.standardEndDate, "2026-08-31");
  assert.equal(activeFishingRules.season.extendedEndDate, "2026-09-15");
  assert.equal(activeFishingRules.catchSize.minimumCm, 35);
  assert.equal(activeFishingRules.catchSize.largeSalmonMaximumCm, 90);
  assert.equal(activeFishingRules.quota.killedSalmonPerSeason, 5);
  assert.equal(activeFishingRules.reporting.deadlineHours, 2);
  assert.equal(activeFishingRules.metadata.sourcesCheckedDate, "2026-08-30");
  assert.equal(activeFishingRules.currentNotice.publishedDate, "2026-08-26");
});

test("statuskontroll gir visningstilstand og riktig løsning", () => {
  assert.equal(statusState("noPermit", ["noPermit"], "blocked"), "error");
  assert.equal(statusState("zoneBorder", ["zoneBorder"], "warning"), "warning");
  assert.equal(statusState("ok", ["noPermit"], "ok"), "ok");
  assert.equal(getStatusResolution("wrongZone"), "permits");
  assert.equal(getStatusResolution("otherRiver"), "disinfection");
  assert.equal(getStatusResolution("closed"), "notifications");
});
