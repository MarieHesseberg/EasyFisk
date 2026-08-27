import assert from "node:assert/strict";
import test from "node:test";

import { isReportLate, reportingDeadlineMs } from "../domain/catches/reporting-deadline.ts";
import { parseMeasurement, validateCatch } from "../domain/catches/validate-catch.ts";
import { getStatusResolution, statusState } from "../domain/fishing-rules/status-checks.ts";
import { activeFishingRules } from "../domain/fishing-rules/mandalselva-2026.ts";
import { getQuotaStatus } from "../domain/quotas/get-quota-status.ts";
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
    { species: "Laks", result: "Avlivet" },
    { species: "Sjøørret", result: "Avlivet" },
  ];
  const session = [
    { species: "Laks", result: "Avlivet" },
    { species: "Laks", result: "Gjenutsatt" },
  ];

  assert.deepEqual(getQuotaStatus(existing, session, 4), {
    killedBefore: 1,
    killedInSession: 1,
    remaining: 2,
    seasonAvailable: true,
    dailyValid: true,
  });
  assert.equal(
    getQuotaStatus(existing, [...session, { species: "Laks", result: "Avlivet" }], 4).dailyValid,
    false,
  );
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
  assert.equal(isDateWithinZoneSeason("2026-06-01", 3), true);
  assert.equal(isDateWithinZoneSeason("2026-09-01", 3), false);
  assert.deepEqual(getSubzones(2), ["Fuskeland B", "Hauge", "Holmesland", "Nøding", "Bringsdal"]);
});

test("aktivt regelgrunnlag samler versjon, sesong, størrelser og kvoter", () => {
  assert.equal(activeFishingRules.metadata.versionDate, "2026-08-01");
  assert.equal(activeFishingRules.season.standardEndDate, "2026-08-31");
  assert.equal(activeFishingRules.season.extendedEndDate, "2026-09-15");
  assert.equal(activeFishingRules.catchSize.minimumCm, 35);
  assert.equal(activeFishingRules.catchSize.largeSalmonMaximumCm, 90);
  assert.equal(activeFishingRules.quota.killedSalmonPerSeason, 5);
  assert.equal(activeFishingRules.reporting.deadlineHours, 2);
});

test("statuskontroll gir visningstilstand og riktig løsning", () => {
  assert.equal(statusState("noPermit", ["noPermit"], "blocked"), "error");
  assert.equal(statusState("zoneBorder", ["zoneBorder"], "warning"), "warning");
  assert.equal(statusState("ok", ["noPermit"], "ok"), "ok");
  assert.equal(getStatusResolution("wrongZone"), "Mine fiskekort");
  assert.equal(getStatusResolution("otherRiver"), "Desinfisering");
  assert.equal(getStatusResolution("closed"), "Varsler og stengninger");
});
