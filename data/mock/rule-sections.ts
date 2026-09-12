import type { RuleSection } from "@/domain/fishing-rules/rule";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { localized } from "@/domain/localization/localized-text";

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
    summary: localized(
      `Sesong og utvidelser i ${metadata.seasonYear}`,
      `Season and extensions in ${metadata.seasonYear}`,
    ),
    rules: [
      localized(
        `Sone 1, 2 og 3: ${season.standardZoneLabel}.`,
        `Zones 1, 2 and 3: 1 June–31 August.`,
      ),
      localized(
        `Sone 4 er utvidet til ${season.extendedEndLabel} ${metadata.seasonYear} etter midtsesongevalueringen.`,
        `Zone 4 has been extended to 15 September ${metadata.seasonYear} following the mid-season evaluation.`,
      ),
      localized(
        `Delsonene Bjåhylen og Nodehylen i sone 4 stenger ${season.standardEndLabel}.`,
        `The Bjåhylen and Nodehylen sub-zones in zone 4 close on 31 August.`,
      ),
      "Kosåna følger fisketidene for sone 4. Fisketidene kan endres dersom bestandssituasjonen krever det.",
      "Fiskekortsalget ble avsluttet 26. august 2026 kl. 09.00. Allerede kjøpte kort kan brukes i gyldighetstiden.",
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
      localized(
        `Døgnkvote: ${quota.killedSalmonPerDay} avlivet laks og 1 avlivet sjøaure per fisker.`,
        `Daily quota: ${quota.killedSalmonPerDay} harvested salmon and 1 harvested sea trout per angler.`,
      ),
      "Når én laks er avlivet, skal alt fiske stoppe til neste fiskerdøgn, også fiske etter sjøørret.",
      localized(
        `Døgnkvote for gjenutsatt laks er ${quota.releasedSalmonPerDay}.`,
        `The daily quota for released salmon is ${quota.releasedSalmonPerDay}.`,
      ),
      "Kvotedøgnet følger fiskekortdøgnet. I begrensede delsoner er dette normalt kl. 18.00–17.59.",
    ],
  },
  {
    id: "seasonquota",
    icon: "stats",
    title: "Sesongkvoter",
    summary: localized(`Regler oppdatert ${metadata.shortVersionLabel}`, "Rules updated 1 August"),
    rules: [
      localized(
        `Sesongkvote fra ${metadata.shortVersionLabel}: ${quota.killedSalmonPerSeason} avlivede laks.`,
        `Season quota from 1 August: ${quota.killedSalmonPerSeason} harvested salmon.`,
      ),
      localized(
        `Én av dem kan være opptil ${catchSize.largeSalmonMaximumCm} cm. De øvrige skal være under ${catchSize.regularSalmonMaximumCm} cm.`,
        `One may be up to ${catchSize.largeSalmonMaximumCm} cm. The others must be under ${catchSize.regularSalmonMaximumCm} cm.`,
      ),
      localized(
        `Sesongkvote for gjenutsatt laks er ${quota.releasedSalmonPerSeason}.`,
        `The season quota for released salmon is ${quota.releasedSalmonPerSeason}.`,
      ),
      localized(
        `Når ${quota.killedSalmonPerSeason} laks er avlivet, skal alt fiske stoppe resten av sesongen, også etter sjøørret og med fang og slipp.`,
        `Once ${quota.killedSalmonPerSeason} salmon have been harvested, all fishing must stop for the rest of the season, including sea trout fishing and catch and release.`,
      ),
    ],
  },
  {
    id: "release",
    icon: "leaf",
    title: "Gjenutsetting",
    summary: "Størrelse, utstyr og behandling",
    rules: [
      localized(
        `Minstemålet for laks og sjøørret er ${catchSize.minimumCm} cm. Fisk under minstemålet skal gjenutsettes.`,
        `The minimum size for salmon and sea trout is ${catchSize.minimumCm} cm. Fish below the minimum size must be released.`,
      ),
      "Ha målebånd, krokløsertang og helst knuteløs håv tilgjengelig.",
      "Laksen skal ikke løftes ut av vannet. Eventuelle bilder tas mens fisken ligger i vannfilmen.",
      "All vinterstøing skal gjenutsettes. Fisk med soppsmitte, regnbueørret og pukkellaks skal ikke gjenutsettes, men leveres til oppsynet.",
    ],
  },
  {
    id: "closure",
    icon: "bell",
    title: "Temperatur og stengning",
    summary: localized(
      `${temperature.closureThresholdCelsius} °C og ekstraordinære forhold`,
      `${temperature.closureThresholdCelsius} °C and exceptional conditions`,
    ),
    rules: [
      localized(
        `Alt fiske stopper når vanntemperaturen overstiger ${temperature.closureThresholdCelsius} °C, målt på Kjølemo.`,
        `All fishing stops when the water temperature exceeds ${temperature.closureThresholdCelsius} °C, measured at Kjølemo.`,
      ),
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
      localized(
        `Fangst skal rapporteres løpende, så raskt som mulig og innen ${reporting.deadlineHours} timer.`,
        `Catches must be reported continuously, as soon as possible and within ${reporting.deadlineHours} hours.`,
      ),
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
      localized(
        `Ta med alt avfall. Ikke fell trær eller bryt kvist. Bålbrenning er ikke tillatt ${nature.fireBanPeriodLabel}.`,
        "Take all waste with you. Do not fell trees or break branches. Open fires are prohibited from 15 April to 15 September.",
      ),
    ],
  },
];
