import type { CatchRecord, CatchOutcome } from "../catches/catch.ts";
import { activeFishingRules } from "../fishing-rules/mandalselva-2026.ts";
import { getNorwegianCalendarDate } from "./get-quota-status.ts";
import type { DemoStatus } from "../fishing-rules/rule.ts";

export type FishingStartQuotaStatus = {
  dailyReached: boolean;
  seasonReached: boolean;
  killedToday: number;
  killedThisSeason: number;
  releasedToday: number;
  releasedThisSeason: number;
};

export function getFishingStartQuotaStatus(
  catches: CatchRecord[],
  now = Date.now(),
): FishingStartQuotaStatus {
  const currentDay = getNorwegianCalendarDate(now);
  const seasonCatches = catches.filter((record) => {
    const date = getNorwegianCalendarDate(record.caughtAt);
    return (
      date >= activeFishingRules.season.startDate &&
      date <= activeFishingRules.season.extendedEndDate
    );
  });
  const todayCatches = seasonCatches.filter(
    (record) => getNorwegianCalendarDate(record.caughtAt) === currentDay,
  );
  const killedToday = countSalmon(todayCatches, "Avlivet");
  const killedThisSeason = countSalmon(seasonCatches, "Avlivet");
  const releasedToday = countSalmon(todayCatches, "Gjenutsatt");
  const releasedThisSeason = countSalmon(seasonCatches, "Gjenutsatt");

  return {
    killedToday,
    killedThisSeason,
    releasedToday,
    releasedThisSeason,
    dailyReached:
      killedToday >= activeFishingRules.quota.killedSalmonPerDay ||
      releasedToday >= activeFishingRules.quota.releasedSalmonPerDay,
    seasonReached:
      killedThisSeason >= activeFishingRules.quota.killedSalmonPerSeason ||
      releasedThisSeason >= activeFishingRules.quota.releasedSalmonPerSeason,
  };
}

export function getDisplayedQuotaStatus(
  actual: FishingStartQuotaStatus,
  demoStatus: DemoStatus,
  isTestMode: boolean,
): FishingStartQuotaStatus {
  if (!isTestMode) return actual;
  if (demoStatus === "dailyQuota") {
    return {
      ...actual,
      killedToday: activeFishingRules.quota.killedSalmonPerDay,
      releasedToday: 0,
      dailyReached: true,
      seasonReached: false,
    };
  }
  if (demoStatus === "seasonQuota") {
    return {
      ...actual,
      killedToday: 0,
      releasedToday: 0,
      killedThisSeason: activeFishingRules.quota.killedSalmonPerSeason,
      dailyReached: false,
      seasonReached: true,
    };
  }
  return {
    killedToday: 0,
    killedThisSeason: 0,
    releasedToday: 0,
    releasedThisSeason: 0,
    dailyReached: false,
    seasonReached: false,
  };
}

function countSalmon(catches: CatchRecord[], outcome: CatchOutcome) {
  return catches.filter((record) => record.species === "Laks" && record.result === outcome).length;
}
