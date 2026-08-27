type QuotaCatch = {
  species: string;
  result: string;
  caughtAt?: number;
};

export function countKilledSalmonForDay(catches: QuotaCatch[], day: string) {
  return catches.filter(
    (item) =>
      item.species === "Laks" &&
      item.result === "Avlivet" &&
      item.caughtAt !== undefined &&
      new Date(item.caughtAt).toISOString().slice(0, 10) === day,
  ).length;
}

export function getQuotaStatus(
  existingCatches: QuotaCatch[],
  sessionCatches: QuotaCatch[],
  seasonLimit = 5,
) {
  const killedBefore = countKilled(existingCatches);
  const killedInSession = countKilled(sessionCatches);

  return {
    killedBefore,
    killedInSession,
    remaining: Math.max(0, seasonLimit - killedBefore - killedInSession),
    seasonAvailable: killedBefore + killedInSession < seasonLimit,
    dailyValid: killedInSession <= 1,
  };
}

function countKilled(catches: QuotaCatch[]) {
  return catches.filter((item) => item.species === "Laks" && item.result === "Avlivet").length;
}
