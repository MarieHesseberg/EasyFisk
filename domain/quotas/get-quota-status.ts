import { riverDate } from "../shared/river-time.ts";
import { activeFishingRules } from "../fishing-rules/mandalselva-2026.ts";

type QuotaCatch = {
  species: string;
  result: string;
  caughtAt?: number;
};

export function getNorwegianCalendarDate(timestamp: number) {
  return riverDate(timestamp);
}

export function countKilledSalmonForDay(catches: QuotaCatch[], day: string) {
  return catches.filter(
    (item) =>
      item.species === "Laks" &&
      item.result === "Avlivet" &&
      item.caughtAt !== undefined &&
      getNorwegianCalendarDate(item.caughtAt) === day,
  ).length;
}

export function getQuotaStatus(
  existingCatches: QuotaCatch[],
  sessionCatches: QuotaCatch[],
  seasonLimit = activeFishingRules.quota.killedSalmonPerSeason,
) {
  const killedBefore = countKilled(existingCatches.filter(isInActiveSeason));
  const killedInSession = countKilled(sessionCatches.filter(isInActiveSeason));

  return {
    killedBefore,
    killedInSession,
    remaining: Math.max(0, seasonLimit - killedBefore - killedInSession),
    seasonAvailable: killedBefore + killedInSession < seasonLimit,
    dailyValid: killedInSession <= activeFishingRules.quota.killedSalmonPerDay,
  };
}

function isInActiveSeason(item: QuotaCatch) {
  if (item.caughtAt === undefined) return false;

  const caughtDate = getNorwegianCalendarDate(item.caughtAt);
  return (
    caughtDate >= activeFishingRules.season.startDate &&
    caughtDate <= activeFishingRules.season.extendedEndDate
  );
}

function countKilled(catches: QuotaCatch[]) {
  return catches.filter((item) => item.species === "Laks" && item.result === "Avlivet").length;
}
