import type { FishingContentRepository } from "@/data/contracts/fishing-content-repository";
import { demoStatuses } from "@/data/mock/demo-scenarios";
import { zones } from "@/data/mock/fishing-zones";
import { ruleSections } from "@/data/mock/rule-sections";

export const mockFishingContentRepository: FishingContentRepository = {
  getDemoScenarios: () => demoStatuses,
  getRuleSections: () => ruleSections,
  getZones: () => zones,
  findZone: (zoneId) => zones.find((zone) => zone.id === zoneId),
};
