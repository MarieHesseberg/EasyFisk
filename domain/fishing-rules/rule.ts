export type DemoStatus =
  | "allMissing"
  | "ok"
  | "noPermit"
  | "wrongZone"
  | "expiredDisinfection"
  | "otherRiver"
  | "noFee"
  | "dailyQuota"
  | "seasonQuota"
  | "lateReport"
  | "hotWater"
  | "closed"
  | "zoneBorder";
export type StatusLevel = "ok" | "warning" | "blocked";
export type DemoScenario = {
  id: DemoStatus;
  label: LocalizedText | string;
  title: LocalizedText | string;
  detail: LocalizedText | string;
  level: StatusLevel;
  action?: LocalizedText | string;
};
export type RuleSectionId =
  | "documentation"
  | "season"
  | "gear"
  | "daily"
  | "seasonquota"
  | "release"
  | "closure"
  | "reporting"
  | "zones"
  | "conduct";
export type RuleSection = {
  id: RuleSectionId;
  icon: string;
  title: string;
  summary: LocalizedText | string;
  rules: (LocalizedText | string)[];
};
import type { LocalizedText } from "@/domain/localization/localized-text";
