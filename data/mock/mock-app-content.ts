import type { AppContent } from "../contracts/app-content-repository.ts";
import { activeFishingRules } from "../../domain/fishing-rules/mandalselva-2026.ts";

const { currentNotice, metadata, temperature } = activeFishingRules;

export const mockAppContent: AppContent = {
  demoFeatures: [
    "Samlet kontroll av fiskekort, avgift, desinfisering og kvote",
    "Start/stopp av fiskeøkt med GPS-forslag til sone",
    "Fangstrapport i tre steg med automatisk tid og sone",
    "Nullfangst, fiskehistorikk og personlig kvoteregnskap",
    "Veiledende kart over de fire faktiske hovedsonene",
    "Regler tilpasset sesong, sone og fangst",
    "Varsler om temperatur, stengninger og rapporteringsfrist",
    "Eksempel på aggregert fangst- og innsatsstatistikk",
    "Kontrollkort for oppsyn, favorittsoner og tilbakemeldinger",
  ],
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
    { icon: "bell", message: currentNotice.title },
    { icon: "clock", message: "Eksempelkortet utløper i dag kl. 17:59." },
    { icon: "bell", message: `Reglene ble oppdatert ${metadata.shortVersionLabel}.` },
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
      station: "Mandalselva Villakssenter",
      registeredAt: "30. juli 2026 · 14:22",
      validUntil: "19. august 2026 · 14:22",
      otherRivers: "Ingen registrert etterpå",
    },
    disinfectionStations: [
      { title: "Mandalselva Villakssenter", description: "Laudal" },
      { title: "Villmarkscampen", description: "Mjåland" },
      { title: "Sandnes Camping", description: "Mandal" },
      { title: "Desinfisering ved fiskesonene", description: "Fuskeland" },
    ],
    favoriteSuggestion: "Sone 4",
    favoriteZoneDescriptions: [
      "Eksempel · fiskekort registrert",
      "Eksempel · delsone med eget fiskekort",
    ],
    notificationStatus:
      "Ingen direktekobling til elvas varslingssystem. Kontroller alltid dagsaktuelle meldinger hos Mandalselva Elveeigarlag.",
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
    menuItems: [
      {
        destination: "permits",
        icon: "ticket",
        title: "Mine fiskekort",
        description: "Aktive, kommende og tidligere kort",
      },
      {
        destination: "disinfection",
        icon: "shield",
        title: "Desinfisering",
        description: "Gyldighet og registreringssted",
      },
      {
        destination: "notifications",
        icon: "bell",
        title: "Varsler og stengninger",
        description: "Regelendringer, temperatur og frister",
      },
      {
        destination: "favorite-zones",
        icon: "map",
        title: "Favorittsoner",
        description: "Rask tilgang til soner og delsoner",
      },
      {
        destination: "profile-privacy",
        icon: "user",
        title: "Profil og personvern",
        description: "Språk, samtykker og konto",
      },
    ],
  },
};
