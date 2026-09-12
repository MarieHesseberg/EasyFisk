import type { DemoScenario } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { localized as t } from "@/domain/localization/localized-text";

const { temperature } = activeFishingRules;
const scenario = (value: DemoScenario) => value;

export const demoStatuses: DemoScenario[] = [
  scenario({
    id: "allMissing",
    label: t("All dokumentasjon mangler", "All documentation is missing"),
    title: t("All dokumentasjon mangler", "All documentation is missing"),
    detail: t(
      "Fiskekort, desinfisering og statlig fiskeravgift er satt som manglende.",
      "The fishing permit, disinfection and national fishing fee are marked as missing.",
    ),
    level: "blocked",
    action: t("Se dokumentasjon", "View documentation"),
  }),
  scenario({
    id: "ok",
    label: t("Alt er i orden (oppstart tillatt)", "Everything is in order (start permitted)"),
    title: t("Du er klar til å fiske", "You are ready to fish"),
    detail: t(
      "Alle krav er kontrollert. Du kan fortsette til sonevalg.",
      "All requirements have been checked. You can continue to zone selection.",
    ),
    level: "ok",
  }),
  scenario({
    id: "noPermit",
    label: t("Fiskekort mangler", "Fishing permit missing"),
    title: t("Du mangler fiskekort", "You need a fishing permit"),
    detail: t(
      "Det finnes ikke et gyldig fiskekort på profilen din.",
      "There is no valid fishing permit on your profile.",
    ),
    level: "blocked",
    action: t("Registrer fiskekort", "Register fishing permit"),
  }),
  scenario({
    id: "wrongZone",
    label: t("Kortet gjelder feil sone", "Permit is for the wrong zone"),
    title: t("Kortet gjelder ikke Sone 3", "The permit is not valid for Zone 3"),
    detail: t(
      "Kortet ditt gjelder Sone 2. Velg riktig sone eller registrer et annet kort.",
      "Your permit is valid for Zone 2. Choose the correct zone or register another permit.",
    ),
    level: "blocked",
    action: t("Velg sone fra fiskekortet", "Choose the zone on the permit"),
  }),
  scenario({
    id: "expiredDisinfection",
    label: t("Desinfiseringen er utløpt", "Disinfection has expired"),
    title: t("Desinfisering må fornyes", "Disinfection must be renewed"),
    detail: t(
      "Beviset er utløpt. Utstyret må desinfiseres før fiske kan starte.",
      "The certificate has expired. The equipment must be disinfected before fishing can start.",
    ),
    level: "blocked",
    action: t("Finn desinfiseringsstasjon", "Find a disinfection station"),
  }),
  scenario({
    id: "otherRiver",
    label: t("Besøkt et annet vassdrag", "Another watercourse visited"),
    title: t("Ny desinfisering kreves", "New disinfection required"),
    detail: t(
      "Utstyret er brukt i et annet vassdrag etter siste desinfisering.",
      "The equipment has been used in another watercourse since its last disinfection.",
    ),
    level: "blocked",
    action: t("Finn desinfiseringsstasjon", "Find a disinfection station"),
  }),
  scenario({
    id: "noFee",
    label: t("Fiskeravgift mangler", "National fishing fee missing"),
    title: t("Fiskeravgiften mangler", "The national fishing fee is missing"),
    detail: t(
      "Betaling av statlig fiskeravgift må dokumenteres før laksefiske.",
      "Payment of the national fishing fee must be documented before salmon fishing.",
    ),
    level: "blocked",
    action: t("Registrer dokumentasjon", "Register documentation"),
  }),
  scenario({
    id: "dailyQuota",
    label: t("Døgnkvoten er nådd", "Daily quota reached"),
    title: t("Døgnkvoten er nådd", "Daily quota reached"),
    detail: t(
      "Én avlivet laks er registrert dette fiskerdøgnet. Fisket kan ikke fortsette før neste fiskerdøgn.",
      "One harvested salmon has been recorded this fishing day. Fishing cannot continue until the next fishing day.",
    ),
    level: "blocked",
    action: t("Se kvoteregnskap", "View quota status"),
  }),
  scenario({
    id: "seasonQuota",
    label: t("Sesongkvoten er nådd", "Season quota reached"),
    title: t("Sesongkvoten er nådd", "Season quota reached"),
    detail: t(
      "Fem avlivede laks er registrert denne sesongen. Videre avliving er ikke tillatt.",
      "Five harvested salmon have been recorded this season. No further harvesting is permitted.",
    ),
    level: "warning",
    action: t("Se regler for gjenutsetting", "View catch-and-release rules"),
  }),
  scenario({
    id: "lateReport",
    label: t("Fangstrapport er forsinket", "Catch report is late"),
    title: t("En fangstrapport mangler", "A catch report is missing"),
    detail: t(
      "En tidligere fangst må ferdigstilles før en ny økt kan startes.",
      "A previous catch report must be completed before a new session can start.",
    ),
    level: "blocked",
    action: t("Fullfør fangstrapport", "Complete catch report"),
  }),
  scenario({
    id: "hotWater",
    label: t(
      `Vanntemperaturen er over ${temperature.closureThresholdCelsius} °C`,
      `The water temperature is above ${temperature.closureThresholdCelsius} °C`,
    ),
    title: t("Fisket er stanset", "Fishing is suspended"),
    detail: t(
      `Registrert vanntemperatur er ${String(temperature.demoMeasuredCelsius).replace(".", ",")} °C. Alt fiske er midlertidig stanset.`,
      `The recorded water temperature is ${temperature.demoMeasuredCelsius} °C. All fishing is temporarily suspended.`,
    ),
    level: "blocked",
    action: t("Se temperatur og varsel", "View temperature and notice"),
  }),
  scenario({
    id: "closed",
    label: t("Sonen eller elva er stengt", "The zone or river is closed"),
    title: t("Sone 3 er midlertidig stengt", "Zone 3 is temporarily closed"),
    detail: t(
      "Det er publisert et aktivt stengningsvarsel for valgt sone.",
      "An active closure notice has been published for the selected zone.",
    ),
    level: "blocked",
    action: t("Se åpne soner", "View open zones"),
  }),
  scenario({
    id: "zoneBorder",
    label: t("GPS ved en sonegrense", "GPS near a zone boundary"),
    title: t("Posisjonen er nær en sonegrense", "The location is near a zone boundary"),
    detail: t(
      "GPS-treffet er usikkert. Kontroller fysisk skilting og velg sone manuelt.",
      "The GPS result is uncertain. Check signs on site and select the zone manually.",
    ),
    level: "warning",
    action: t("Velg sone manuelt", "Choose zone manually"),
  }),
];
