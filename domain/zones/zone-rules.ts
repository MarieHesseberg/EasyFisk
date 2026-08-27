import { activeFishingRules } from "../fishing-rules/mandalselva-2026.ts";

export function getZoneSeasonEnd(zoneId: number) {
  const { season } = activeFishingRules;
  return zoneId === season.extendedZoneId ? season.extendedEndDate : season.standardEndDate;
}

export function isDateWithinZoneSeason(date: string, zoneId: number) {
  return date >= activeFishingRules.season.startDate && date <= getZoneSeasonEnd(zoneId);
}

export function getZoneSeasonLabel(zoneId: number) {
  const { season } = activeFishingRules;
  return zoneId === season.extendedZoneId ? season.extendedZoneLabel : season.standardZoneLabel;
}

export function getSubzones(zoneId: number) {
  if (zoneId === 2) return ["Fuskeland B", "Hauge", "Holmesland", "Nøding", "Bringsdal"];
  if (zoneId === 4) return ["Bjåhylen", "Nodehylen", "Kosåna", "Manflå"];
  return [];
}
