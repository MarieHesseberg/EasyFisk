import type { FishingContentRepository } from "@/data/contracts/fishing-content-repository";
import { demoStatuses, ruleSections, zones } from "@/data/mock/fishing-data";

export const mockFishingContentRepository: FishingContentRepository = {
  getDemoScenarios: () => demoStatuses,
  getRuleSections: () => ruleSections,
  getZones: () => zones,
  findZone: (zoneId) => zones.find((zone) => zone.id === zoneId),
};
