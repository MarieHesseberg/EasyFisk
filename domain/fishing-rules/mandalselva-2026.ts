/** Samlet og versjonert regelgrunnlag for Mandalselva-sesongen 2026. */
export const mandalselvaRules2026 = {
  metadata: {
    river: "Mandalselva",
    seasonYear: 2026,
    versionDate: "2026-08-01",
    versionLabel: "1. august 2026",
    shortVersionLabel: "1. august",
    numericVersionLabel: "01.08.2026",
    sourcesCheckedDate: "2026-08-19",
    sourcesCheckedLabel: "19. august 2026",
    numericSourcesCheckedLabel: "19.08.2026",
  },
  season: {
    startDate: "2026-06-01",
    startLabel: "1. juni",
    standardEndDate: "2026-08-31",
    standardEndLabel: "31. august",
    extendedEndDate: "2026-09-15",
    extendedEndLabel: "15. september",
    extendedZoneId: 4,
    standardZoneLabel: "1. juni–31. august",
    extendedZoneLabel: "1. juni–15. september",
  },
  catchSize: {
    minimumCm: 35,
    regularSalmonMaximumCm: 65,
    largeSalmonMaximumCm: 90,
    largeSalmonAllowance: 1,
  },
  quota: {
    killedSalmonPerDay: 1,
    killedSalmonPerSeason: 5,
    releasedSalmonPerDay: 2,
    releasedSalmonPerSeason: 20,
  },
  reporting: {
    deadlineHours: 2,
  },
  temperature: {
    closureThresholdCelsius: 21,
    demoMeasuredCelsius: 21.4,
  },
  nature: {
    fireBanPeriodLabel: "15. april–15. september",
  },
} as const;

export const activeFishingRules = mandalselvaRules2026;
