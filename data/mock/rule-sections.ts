import type { RuleSection } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";

const { catchSize, metadata, nature, quota, reporting, season, temperature } = activeFishingRules;

export const ruleSections: RuleSection[] = [
  {
    id: "documentation",
    icon: "shield",
    title: "Dokumentasjon",
    summary: "Kort, avgift og desinfisering",
    rules: [
      "Fiskekortet er personlig og må stå i fiskerens navn.",
      "Gyldig fiskekort og dokumentasjon på betalt statlig fiskeravgift skal kunne vises til oppsynet.",
      "Alt fiskeutstyr, også båt, kano og motor, skal desinfiseres før bruk i Mandalselva.",
      "Desinfisering gjelder i 20 dager, men blir ugyldig straks utstyret har vært brukt i et annet vassdrag.",
    ],
  },
  {
    id: "season",
    icon: "clock",
    title: "Fisketider",
    summary: `Sesong og utvidelser i ${metadata.seasonYear}`,
    rules: [
      `Sone 1, 2 og 3: ${season.standardZoneLabel}.`,
      `Sone 4 er utvidet til ${season.extendedEndLabel} ${metadata.seasonYear} etter midtsesongevalueringen.`,
      `Delsonene Bjåhylen og Nodehylen i sone 4 stenger ${season.standardEndLabel}.`,
      "Kosåna følger fisketidene for sone 4. Fisketidene kan endres dersom bestandssituasjonen krever det.",
    ],
  },
  {
    id: "gear",
    icon: "fish",
    title: "Redskap",
    summary: "Tillatte agn, kroker og forbud",
    rules: [
      "Flue, sluk og mark er tillatt i alle soner.",
      "Levende fisk som agn, krøking og utstyr som kan fylles med vann er forbudt.",
      "Maksimalt én treblekrok på hvert fiskeredskap.",
      "Kroker skal være mothakeløse eller ha innklemt mothake. Sirkelkrok er påbudt ved markfiske.",
    ],
  },
  {
    id: "daily",
    icon: "clock",
    title: "Døgnkvoter",
    summary: "Kvoter per fiskerdøgn",
    rules: [
      `Døgnkvote: ${quota.killedSalmonPerDay} avlivet laks og 1 avlivet sjøaure per fisker.`,
      "Når én laks er avlivet, skal alt fiske stoppe til neste fiskerdøgn, også fiske etter sjøørret.",
      `Døgnkvote for gjenutsatt laks er ${quota.releasedSalmonPerDay}.`,
      "Kvotedøgnet følger fiskekortdøgnet. I begrensede delsoner er dette normalt kl. 18.00–17.59.",
    ],
  },
  {
    id: "seasonquota",
    icon: "stats",
    title: "Sesongkvoter",
    summary: `Regler oppdatert ${metadata.shortVersionLabel}`,
    rules: [
      `Sesongkvote fra ${metadata.shortVersionLabel}: ${quota.killedSalmonPerSeason} avlivede laks.`,
      `Én av dem kan være opptil ${catchSize.largeSalmonMaximumCm} cm. De øvrige skal være under ${catchSize.regularSalmonMaximumCm} cm.`,
      `Sesongkvote for gjenutsatt laks er ${quota.releasedSalmonPerSeason}.`,
      `Når ${quota.killedSalmonPerSeason} laks er avlivet, skal alt fiske stoppe resten av sesongen, også etter sjøørret og med fang og slipp.`,
    ],
  },
  {
    id: "release",
    icon: "leaf",
    title: "Gjenutsetting",
    summary: "Størrelse, utstyr og behandling",
    rules: [
      `Minstemålet for laks og sjøørret er ${catchSize.minimumCm} cm. Fisk under minstemålet skal gjenutsettes.`,
      "Ha målebånd, krokløsertang og helst knuteløs håv tilgjengelig.",
      "Laksen skal ikke løftes ut av vannet. Eventuelle bilder tas mens fisken ligger i vannfilmen.",
      "All vinterstøing skal gjenutsettes. Fisk med soppsmitte, regnbueørret og pukkellaks skal ikke gjenutsettes, men leveres til oppsynet.",
    ],
  },
  {
    id: "closure",
    icon: "bell",
    title: "Temperatur og stengning",
    summary: `${temperature.closureThresholdCelsius} °C og ekstraordinære forhold`,
    rules: [
      `Alt fiske stopper når vanntemperaturen overstiger ${temperature.closureThresholdCelsius} °C, målt på Kjølemo.`,
      "Elveeigarlaget kan stenge hele eller deler av elva ved forhold som kan påvirke bestanden.",
      "Endringer publiseres på Mandalselvas nettsider. Fysisk skilting og siste publiserte varsel gjelder.",
    ],
  },
  {
    id: "reporting",
    icon: "book",
    title: "Fangstrapportering",
    summary: "Fangst, gjenutsetting og innsats",
    rules: [
      `Fangst skal rapporteres løpende, så raskt som mulig og innen ${reporting.deadlineHours} timer.`,
      "Rapporten skal inneholde fangst, dato og vekt. Gjenutsatt fisk rapporteres med dato og omtrentlig vekt.",
      "Fiskeinnsats skal rapporteres. Nullfangst rapporteres for fiskedøgn uten fangst.",
      "Sesongkortfiskere må hente et rapporteringskort for hvert døgn de ønsker å fiske.",
    ],
  },
  {
    id: "zones",
    icon: "map",
    title: "Soneregler",
    summary: "Gyldig område og lokale avvik",
    rules: [
      "Kart på nett er veiledende. Oppmerking i elva og lokale regler bestemmer gyldig fiskeområde.",
      "Sone 2 og flere delsoner i sone 4 har begrenset kortsalg og egne korttider.",
      "Fiske er forbudt 50 meter ovenfor og nedenfor fisketrapper, støpte terskler og dammer.",
      "Fiske fra broer og ledgjerde for smolt i Manflåvatn er ikke tillatt.",
    ],
  },
  {
    id: "conduct",
    icon: "user",
    title: "Allmenne hensyn",
    summary: "Natur, grunneiere og andre fiskere",
    rules: [
      "Bevegelig fiske praktiseres: flytt noen meter nedstrøms etter hvert kast.",
      "Start ovenfor andre fiskere og vent til det er plass før du går ut.",
      "Ikke gå over dyrket mark eller gjennom gårdstun. Respekter private brygger og båtplasser.",
      `Ta med alt avfall. Ikke fell trær eller bryt kvist. Bålbrenning er ikke tillatt ${nature.fireBanPeriodLabel}.`,
    ],
  },
];
