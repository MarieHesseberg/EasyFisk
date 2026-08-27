export type Screen = "home" | "map" | "rules" | "stats" | "more";

export type SessionRecord = {
  start: number;
  end: number;
  duration: number;
  zone: string;
  result: string;
};

export type CatchRecord = {
  id: string;
  caughtAt: number;
  submittedAt: number;
  sessionStart: number;
  species: string;
  result: string;
  length: number;
  weight: number;
  zone: string;
  violation: boolean;
  late: boolean;
  imageName?: string;
  imageData?: string;
  comment?: string;
  correction?: string;
};

export type DemoStatus =
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

export type FlowMode = "start" | "stop" | "summary";

export type StatusLevel = "ok" | "warning" | "blocked";

export type DemoScenario = {
  id: DemoStatus;
  label: string;
  title: string;
  detail: string;
  level: StatusLevel;
  action?: string;
};

export type FishingZone = {
  id: number;
  name: string;
  status: string;
  note: string;
  color: string;
  season: string;
  desc: string;
};

export type RuleSection = {
  id: string;
  icon: string;
  title: string;
  summary: string;
  rules: string[];
};
