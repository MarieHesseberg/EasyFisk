import assert from "node:assert/strict";
import test from "node:test";

import { isReportLate, reportingDeadlineMs } from "../domain/catches/reporting-deadline.ts";
import { parseMeasurement, validateCatch } from "../domain/catches/validate-catch.ts";
import { getStatusResolution, statusState } from "../domain/fishing-rules/status-checks.ts";
import { activeFishingRules } from "../domain/fishing-rules/mandalselva-2026.ts";
import { resolveStatusEngine } from "../domain/fishing-rules/resolve-status-engine.ts";
import {
  getDisplayedQuotaStatus,
  getFishingStartQuotaStatus,
} from "../domain/quotas/get-fishing-start-quota-status.ts";
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

test("normalmodus bruker registrerte dokumenter som eneste statusgrunnlag", () => {
  const actual = {
    complete: false,
    valid: { permit: true, disinfection: false, fee: true },
    missingLabels: ["gyldig desinfisering"],
  };
  const selectedTest = {
    id: "ok",
    label: "Alt i orden",
    title: "Du er klar",
    detail: "Simulert godkjenning",
    level: "ok",
  };

  const resolved = resolveStatusEngine(actual, selectedTest, false);

  assert.equal(resolved.readiness, actual);
  assert.equal(resolved.status, "expiredDisinfection");
  assert.equal(resolved.scenario.level, "blocked");
});

test("testmodus overstyrer dokumentstatus uten å endre faktiske dokumenter", () => {
  const actual = {
    complete: false,
    valid: { permit: false, disinfection: false, fee: false },
    missingLabels: ["gyldig fiskekort", "gyldig desinfisering", "fiskeravgift"],
  };
  const selectedTest = {
    id: "ok",
    label: "Alt i orden",
    title: "Du er klar",
    detail: "Simulert godkjenning",
    level: "ok",
  };

  const resolved = resolveStatusEngine(actual, selectedTest, true);

  assert.equal(resolved.readiness.complete, true);
  assert.equal(resolved.scenario, selectedTest);
  assert.equal(actual.complete, false);
});

test("registrert dokument løser tilsvarende mangel i testmodus", () => {
  const actual = {
    complete: false,
    valid: { permit: true, disinfection: false, fee: false },
    missingLabels: ["gyldig desinfisering", "fiskeravgift"],
  };
  const missingPermit = {
    id: "noPermit",
    label: "Mangler fiskekort",
    title: "Du mangler fiskekort",
    detail: "Det finnes ikke et gyldig fiskekort på profilen din.",
    level: "blocked",
  };

  const resolved = resolveStatusEngine(actual, missingPermit, true);

  assert.equal(resolved.readiness.complete, true);
  assert.equal(resolved.readiness.valid.permit, true);
  assert.equal(resolved.status, "ok");
  assert.equal(resolved.scenario.level, "ok");
});

test("normalmodus blokkerer oppstart når virkelig døgnkvote er nådd", () => {
  const documents = {
    complete: true,
    valid: { permit: true, disinfection: true, fee: true },
    missingLabels: [],
  };
  const allOkay = {
    id: "ok",
    label: "Alt i orden",
    title: "Du er klar",
    detail: "Alle krav er kontrollert",
    level: "ok",
  };
  const quota = {
    dailyReached: true,
    seasonReached: false,
    killedToday: 1,
    killedThisSeason: 1,
    releasedToday: 0,
    releasedThisSeason: 0,
  };

  const resolved = resolveStatusEngine(documents, allOkay, false, quota);

  assert.equal(resolved.status, "dailyQuota");
  assert.equal(resolved.scenario.level, "blocked");
});

test("testmodus kan overstyre en virkelig nådd kvote", () => {
  const actual = {
    dailyReached: true,
    seasonReached: true,
    killedToday: 1,
    killedThisSeason: 5,
    releasedToday: 0,
    releasedThisSeason: 0,
  };
  const displayed = getDisplayedQuotaStatus(actual, "ok", true);

  assert.equal(displayed.dailyReached, false);
  assert.equal(displayed.seasonReached, false);
  assert.equal(displayed.killedToday, 0);
});

test("lokale fangster beregner både avlivet og gjenutsatt døgnkvote", () => {
  const now = Date.parse("2026-07-10T12:00:00+02:00");
  const base = {
    id: "ME-1",
    caughtAt: now,
    submittedAt: now,
    sessionStart: now - 1_000,
    species: "Laks",
    length: 55,
    weight: 2,
    zone: "Sone 3",
    violation: false,
    late: false,
  };
  const status = getFishingStartQuotaStatus(
    [
      { ...base, result: "Gjenutsatt" },
      { ...base, id: "ME-2", result: "Gjenutsatt" },
    ],
    now,
  );

  assert.equal(status.releasedToday, 2);
  assert.equal(status.dailyReached, true);
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
