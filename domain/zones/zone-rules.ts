const seasonStart = "2026-06-01";

export function getZoneSeasonEnd(zoneId: number) {
  return zoneId === 4 ? "2026-09-15" : "2026-08-31";
}

export function isDateWithinZoneSeason(date: string, zoneId: number) {
  return date >= seasonStart && date <= getZoneSeasonEnd(zoneId);
}

export function getSubzones(zoneId: number) {
  if (zoneId === 2) return ["Fuskeland B", "Hauge", "Holmesland", "Nøding", "Bringsdal"];
  if (zoneId === 4) return ["Bjåhylen", "Nodehylen", "Kosåna", "Manflå"];
  return [];
}
