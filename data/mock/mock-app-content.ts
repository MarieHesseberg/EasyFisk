import type { AppContent } from "../contracts/app-content-repository.ts";
import { activeFishingRules } from "../../domain/fishing-rules/mandalselva-2026.ts";

const { metadata, temperature } = activeFishingRules;

export const mockAppContent: AppContent = {
  riverStatus: {
    currentZoneName: "Sone 3 · Øyslebø–Laudal",
    currentZoneShortName: "Sone 3",
    alternatePermitZoneName: "Sone 2 · Fuskeland–Hesså",
    alternatePermitZoneShortName: "Sone 2",
    permitExpiry: "17:59",
    disinfectionSummary: "Gyldig 20 dager · ingen andre vassdrag",
    temperatureCelsius: 11,
    flowCubicMetersPerSecond: 18,
    measurementStation: "Kjølemo",
  },
  headerAlerts: [
    { icon: "check", message: "Elva og Sone 3 er åpne." },
    { icon: "clock", message: "Fiskekortet utløper i dag kl. 17:59." },
    { icon: "bell", message: `Reglene ble oppdatert ${metadata.shortVersionLabel}.` },
  ],
  activityHistory: [
    {
      day: "16",
      title: "Sone 2 · Fuskeland B",
      time: "18:10–21:42 · 3 t 32 min",
      result: "1 laks · gjenutsatt",
    },
    {
      day: "08",
      title: "Sone 1 · Mandal–Krossen",
      time: "19:20–20:55 · 1 t 35 min",
      result: "1 sjøørret · gjenutsatt",
    },
    {
      day: "03",
      title: "Sone 4 · Laudal–Kavfossen",
      time: "06:40–09:05 · 2 t 25 min",
      result: "Nullfangst rapportert",
    },
    {
      day: "12",
      title: "Sone 3 · Øyslebø–Laudal",
      time: "07:15–10:03 · 2 t 48 min",
      result: "Nullfangst rapportert",
    },
  ],
  statistics: {
    areas: ["Hele elva", "Sone 3", "Sone 4"],
    periods: ["Sesongen", "Siste 30 dager", "Denne uken"],
    totalCatches: "286",
    metrics: [
      { icon: "clock", label: "FISKETIMER", value: "4 820" },
      { icon: "stats", label: "FANGST / 10 T", value: "0,59" },
      { icon: "fish", label: "GJENUTSATT", value: "64 %" },
      { icon: "user", label: "FISKEØKTER", value: "418" },
    ],
    weeklyCatchPercentages: [18, 32, 46, 66, 87, 74, 54, 41, 25],
    zoneCatchPercentages: [72, 91, 84, 58],
    zoneCatchTotals: [58, 79, 73, 46],
  },
  feedback: {
    categories: [
      "Ulovlig eller mistenkelig fiske",
      "Syk, skadet eller død fisk",
      "Forsøpling eller miljøproblem",
      "Hindring eller skade i elva",
      "Feil i kart, sone eller informasjon",
      "Annet",
    ],
    organizationName: "Mandalselva Elveeigarlag",
    reference: "ME-TIPS-2026-0819-047",
    positionLabel: "Sone 3",
  },
  profile: {
    initials: "MF",
    fisherId: "10482",
    name: "Prototypebruker",
    maskedPhone: "•• •• •• 82",
    language: "Norsk bokmål",
    controlCodePrefix: "EF",
    controlCardRows: [
      { label: "Fisker", value: "Fisker-ID 10482" },
      { label: "Fiskekort", value: "Sone 3 · gyldig til 17:59" },
      { label: "Fiskeravgift", value: "Dokumentert", isPositive: true },
      { label: "Desinfisering", value: "Gyldig", isPositive: true },
      { label: "Kvote", value: "Fiske tillatt" },
    ],
    activePermit: {
      zone: "Sone 3 · Øyslebø–Laudal",
      summary: "Døgnkort · gyldig i dag til kl. 17:59",
      number: "ME-2026-10482-031",
      holder: "Fisker-ID 10482",
      area: "Hele hovedsone 3",
    },
    previousPermits: [
      { title: "Sone 2 · Fuskeland B", description: "16. juni · utløpt" },
      { title: "Sone 3 · Øyslebø–Laudal", description: "12. juni · utløpt" },
    ],
    disinfection: {
      station: "Marnar Laksesenter",
      registeredAt: "30. juli 2026 · 14:22",
      validUntil: "19. august 2026 · 14:22",
      otherRivers: "Ingen registrert etterpå",
    },
    disinfectionStations: [
      { title: "Marnar Laksesenter", description: "Øyslebø · 2,4 km" },
      { title: "Laudal kortutsalg", description: "Laudal · 13 km" },
      { title: "Mandal servicesenter", description: "Mandal · 21 km" },
    ],
    favoriteSuggestion: "Sone 4 · Laudal–Bjelland",
    favoriteZoneDescriptions: [
      "Åpen · 11 °C · fiskekort registrert",
      "Åpen · delsone med eget fiskekort",
    ],
    notificationStatus: "11 °C ved Kjølemo · ingen aktive stengninger",
    notificationOptions: [
      {
        id: "emergencyClosure",
        label: "Akutt stengning",
        description: "Varsle dersom hele elva eller min sone stenges",
      },
      {
        id: "highTemperature",
        label: "Høy vanntemperatur",
        description: `Varsle når temperaturen nærmer seg ${temperature.closureThresholdCelsius} °C`,
      },
      {
        id: "ruleChanges",
        label: "Regelendringer",
        description: "Varsle når kvoter eller fisketider endres",
      },
      {
        id: "reportingDeadline",
        label: "Rapporteringsfrist",
        description: "Påminnelse hvis en fangst ikke er ferdig rapportert",
      },
    ],
  },
};
