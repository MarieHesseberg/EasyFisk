import type { DemoStatus, StatusLevel } from "../models.ts";

export function statusState(current: DemoStatus, affected: DemoStatus[], level: StatusLevel) {
  if (!affected.includes(current)) return "ok" as const;
  return level === "warning" ? ("warning" as const) : ("error" as const);
}

export function getStatusResolution(status: DemoStatus) {
  if (status === "noPermit" || status === "wrongZone") return "Mine fiskekort";
  if (status === "expiredDisinfection" || status === "otherRiver") return "Desinfisering";
  return "Varsler og stengninger";
}
