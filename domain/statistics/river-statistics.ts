export type RiverSeasonStatistics = {
  year: number;
  salmonCount: number;
  salmonWeightKg: number;
  seaTroutCount: number;
};

export function calculateAverageWeight(statistics: RiverSeasonStatistics) {
  if (statistics.salmonCount === 0) return 0;
  return statistics.salmonWeightKg / statistics.salmonCount;
}

export function calculateChangeFromPrevious(
  current: RiverSeasonStatistics,
  previous?: RiverSeasonStatistics,
) {
  if (!previous?.salmonCount) return null;
  return ((current.salmonCount - previous.salmonCount) / previous.salmonCount) * 100;
}
