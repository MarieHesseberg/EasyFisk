import { activeFishingRules } from "../fishing-rules/mandalselva-2026.ts";

const zone2Subzones = [
  "Grimefossen B",
  "Smeland",
  "Furuholmen Fangst",
  "Holmesland C",
  "Hauge B1",
  "Øvre Nøding",
  "Fuskeland B",
  "Møll",
  "Bringsdal A",
  "Hauge D",
  "Fuskeland D",
  "Nedre Nøding",
  "Bringsdal C",
  "Holmegård 1",
  "Grimefossen A",
  "Strømmen og Laksøya",
  "Fossefjellene syd",
  "Holmesland B",
  "Hauge A",
  "Stoveland",
  "Fuskeland A",
  "Holmesland P",
  "Bjørkenes",
  "Hauge C",
  "Hauge B2",
  "Fuskeland C",
  "Nedre Holum",
  "Bringsdal B",
  "Heia",
  "Fuskeland E Revestien",
  "Nødingfossen",
  "Fossefjellene",
  "Holmesland A",
] as const;

const zone4Subzones = [
  "Strædethylen",
  "Bjåhylen",
  "Laksehylen",
  "Steinshylen",
  "Klevelandsfossen",
  "Nodehylen",
] as const;

export function getZoneSeasonEnd(zoneId: number, subzone = "") {
  const { season } = activeFishingRules;
  if (zoneId === 4 && ["Bjåhylen", "Nodehylen"].includes(subzone)) {
    return season.standardEndDate;
  }
  return zoneId === season.extendedZoneId ? season.extendedEndDate : season.standardEndDate;
}

export function isDateWithinZoneSeason(date: string, zoneId: number, subzone = "") {
  return date >= activeFishingRules.season.startDate && date <= getZoneSeasonEnd(zoneId, subzone);
}

export function getZoneSeasonLabel(zoneId: number) {
  const { season } = activeFishingRules;
  return zoneId === season.extendedZoneId ? season.extendedZoneLabel : season.standardZoneLabel;
}

export function getSubzones(zoneId: number) {
  if (zoneId === 2) return [...zone2Subzones];
  if (zoneId === 4) return [...zone4Subzones];
  return [];
}
