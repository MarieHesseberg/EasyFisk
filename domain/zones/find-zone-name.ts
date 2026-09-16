import type { FishingZone, ZoneId } from "./zone";

const fallbackZone = "Sone 3 · Øyslebø–Laudal";

export function findZoneName(zoneId: ZoneId, zones: readonly FishingZone[], subzone?: string) {
  const name = zones.find((item) => item.id === zoneId)?.name ?? fallbackZone;
  return subzone ? `${name} · ${subzone}` : name;
}
