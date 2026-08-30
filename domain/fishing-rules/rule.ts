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
  label: string;
  title: string;
  detail: string;
  level: StatusLevel;
  action?: string;
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
  summary: string;
  rules: string[];
};
