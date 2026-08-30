import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import type { FishingZone } from "@/domain/zones/zone";

const { season } = activeFishingRules;

export const zones: FishingZone[] = [
  {
    id: 1,
    name: "Sone 1 · Nedre Mandalselva",
    status: "Kontroller dagsstatus",
    note: "5 km · munningen–Vik",
    color: "#8bb5d9",
    season: season.standardZoneLabel,
    desc: "Tre landfiskeområder og felles båtfiske. Båtkort gjelder hele sone 1 og to stenger per båt.",
  },
  {
    id: 2,
    name: "Sone 2 · Leirkjær–Øyslebø",
    status: "Kontroller dagsstatus",
    note: "14 km · 32 delsoner",
    color: "#5f91bd",
    season: season.standardZoneLabel,
    desc: "Personlige kort i delsoner som Hauge, Holmesland, Nøding, Fuskeland og Bringsdal. Fysisk skilting langs elva gjelder.",
  },
  {
    id: 3,
    name: "Sone 3 · Øyslebø–Laudal",
    status: "Valgt demosone",
    note: "13 km · ett kort",
    color: "#2563a6",
    season: season.standardZoneLabel,
    desc: "Ett fiskekort dekker hele sonen. Variert fiske med store flueområder og dype kulper.",
  },
  {
    id: 4,
    name: "Sone 4 · Laudal–Kavfossen",
    status: "Kontroller dagsstatus",
    note: "18 km · Kosåna inkludert",
    color: "#a8c7e0",
    season: season.extendedZoneLabel,
    desc: "Hovedsone fra dam Manflå til Kavfossen og lakseførende del av Kosåna, samt seks navngitte delsoner.",
  },
];
