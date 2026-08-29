import type { CatchRecord, CatchOutcome, FishSpecies } from "../catches/catch.ts";
import { activeFishingRules } from "../fishing-rules/mandalselva-2026.ts";
import { getNorwegianCalendarDate } from "../quotas/get-quota-status.ts";
import type { SessionRecord } from "../sessions/session.ts";

export type PersonalQuotaStatus = {
  usedToday: number;
  dailyLimit: number;
  remainingToday: number;
  usedThisSeason: number;
  seasonLimit: number;
  remainingThisSeason: number;
};

export type PersonalStatistics = {
  sessionCount: number;
  fishingSeconds: number;
  catchCount: number;
  zeroCatchSessionCount: number;
  killedCount: number;
  releasedCount: number;
  salmonCount: number;
  seaTroutCount: number;
  otherSpeciesCount: number;
  catchesPerTenHours: number;
  killedSalmonQuota: PersonalQuotaStatus;
  releasedSalmonQuota: PersonalQuotaStatus;
};

export function calculatePersonalStatistics(
  catches: CatchRecord[],
  sessions: SessionRecord[],
  now = Date.now(),
): PersonalStatistics {
  const fishingSeconds = sessions.reduce((total, session) => total + session.duration, 0);
  const sessionStartsWithCatch = new Set(catches.map((catchRecord) => catchRecord.sessionStart));

  return {
    sessionCount: sessions.length,
    fishingSeconds,
    catchCount: catches.length,
    zeroCatchSessionCount: sessions.filter((session) => !sessionStartsWithCatch.has(session.start))
      .length,
    killedCount: countCatches(catches, undefined, "Avlivet"),
    releasedCount: countCatches(catches, undefined, "Gjenutsatt"),
    salmonCount: countCatches(catches, "Laks"),
    seaTroutCount: countCatches(catches, "Sjøørret"),
    otherSpeciesCount: countCatches(catches, "Annen art"),
    catchesPerTenHours:
      fishingSeconds === 0 ? 0 : roundToOneDecimal(catches.length / (fishingSeconds / 36_000)),
    killedSalmonQuota: calculateQuota(catches, "Avlivet", now),
    releasedSalmonQuota: calculateQuota(catches, "Gjenutsatt", now),
  };
}

function calculateQuota(
  catches: CatchRecord[],
  outcome: CatchOutcome,
  now: number,
): PersonalQuotaStatus {
  const rules = activeFishingRules;
  const dailyLimit =
    outcome === "Avlivet" ? rules.quota.killedSalmonPerDay : rules.quota.releasedSalmonPerDay;
  const seasonLimit =
    outcome === "Avlivet" ? rules.quota.killedSalmonPerSeason : rules.quota.releasedSalmonPerSeason;
  const currentDay = getNorwegianCalendarDate(now);
  const qualifyingCatches = catches.filter(
    (catchRecord) => catchRecord.species === "Laks" && catchRecord.result === outcome,
  );
  const usedToday = qualifyingCatches.filter(
    (catchRecord) => getNorwegianCalendarDate(catchRecord.caughtAt) === currentDay,
  ).length;
  const usedThisSeason = qualifyingCatches.filter((catchRecord) => {
    const caughtDate = getNorwegianCalendarDate(catchRecord.caughtAt);
    return caughtDate >= rules.season.startDate && caughtDate <= rules.season.extendedEndDate;
  }).length;

  return {
    usedToday,
    dailyLimit,
    remainingToday: Math.max(0, dailyLimit - usedToday),
    usedThisSeason,
    seasonLimit,
    remainingThisSeason: Math.max(0, seasonLimit - usedThisSeason),
  };
}

function countCatches(catches: CatchRecord[], species?: FishSpecies, outcome?: CatchOutcome) {
  return catches.filter(
    (catchRecord) =>
      (species === undefined || catchRecord.species === species) &&
      (outcome === undefined || catchRecord.result === outcome),
  ).length;
}

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}
