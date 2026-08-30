import type { DetailDestination } from "../navigation/navigation";
import type { DemoStatus, StatusLevel } from "./rule";

export function statusState(current: DemoStatus, affected: DemoStatus[], level: StatusLevel) {
  if (!affected.includes(current)) return "ok" as const;
  return level === "warning" ? ("warning" as const) : ("error" as const);
}

export function getStatusResolution(status: DemoStatus): DetailDestination {
  if (status === "allMissing") return "control-card";
  if (status === "noPermit" || status === "wrongZone") return "permits";
  if (status === "expiredDisinfection" || status === "otherRiver") return "disinfection";
  return "notifications";
}
