import { zones } from "@/data/mock/fishing-data";

const fallbackZone = "Sone 3 · Øyslebø–Laudal";

export function findZoneName(zoneId: number) {
  return zones.find((item) => item.id === zoneId)?.name ?? fallbackZone;
}
