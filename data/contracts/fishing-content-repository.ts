import type { DemoScenario, RuleSection } from "@/domain/fishing-rules/rule";
import type { FishingZone, ZoneId } from "@/domain/zones/zone";

/** Grensesnittet appen bruker for fiskeinnhold. */
export interface FishingContentRepository {
  getDemoScenarios(): readonly DemoScenario[];
  getRuleSections(): readonly RuleSection[];
  getZones(): readonly FishingZone[];
  findZone(zoneId: ZoneId): FishingZone | undefined;
}
