import type { RiverSeasonStatistics } from "@/domain/statistics/river-statistics";

// Offisielle, avsluttede sesongtall fra SSB tabell 08991. Tallene gjelder hele vassdraget.
export const mandalselvaSeasonStatistics: readonly RiverSeasonStatistics[] = [
  { year: 2021, salmonCount: 3071, salmonWeightKg: 9630, seaTroutCount: 338 },
  { year: 2022, salmonCount: 3144, salmonWeightKg: 9036, seaTroutCount: 554 },
  { year: 2023, salmonCount: 2691, salmonWeightKg: 9007, seaTroutCount: 206 },
  { year: 2024, salmonCount: 1341, salmonWeightKg: 3460, seaTroutCount: 146 },
  { year: 2025, salmonCount: 1045, salmonWeightKg: 3086, seaTroutCount: 160 },
];

export const mandalselvaStatisticsSource = {
  label: "SSB tabell 08991 · Elvefiske",
  url: "https://www.ssb.no/statbank/table/08991",
  updatedLabel: "oppdatert 6. februar 2026",
} as const;
