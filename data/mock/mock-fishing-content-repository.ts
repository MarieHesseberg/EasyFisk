import type { FishingContentRepository } from "@/data/contracts/fishing-content-repository";
import { demoStatuses } from "@/data/mock/demo-scenarios";
import { zones } from "@/data/mock/fishing-zones";
import { ruleSections } from "@/data/mock/rule-sections";
import { mockFishingDocuments } from "@/data/mock/mock-fishing-documents";

export const mockFishingContentRepository: FishingContentRepository = {
  getDemoScenarios: () => demoStatuses,
  getDemoDocuments: () => mockFishingDocuments,
  getRuleSections: () => ruleSections,
  getZones: () => zones,
  getSuggestedZoneId: () => 3,
  findZone: (zoneId) => zones.find((zone) => zone.id === zoneId),
};
