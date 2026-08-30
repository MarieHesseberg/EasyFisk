import type { DemoScenario, RuleSection } from "@/domain/fishing-rules/rule";
import type { FishingZone, ZoneId } from "@/domain/zones/zone";
import type { DocumentKind, FishingDocument } from "@/domain/documents/fishing-document";

/** Grensesnittet appen bruker for fiskeinnhold. */
export interface FishingContentRepository {
  getDemoScenarios(): readonly DemoScenario[];
  getDemoDocuments(): Readonly<Record<DocumentKind, FishingDocument>>;
  getRuleSections(): readonly RuleSection[];
  getZones(): readonly FishingZone[];
  getSuggestedZoneId(): ZoneId;
  findZone(zoneId: ZoneId): FishingZone | undefined;
}
