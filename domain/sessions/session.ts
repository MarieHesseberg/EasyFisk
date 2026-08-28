export type FlowMode = "start" | "stop" | "summary";
export type ActiveSessionSnapshot = { startTime: number; zone: import("../zones/zone").ZoneId };
export type SessionRecord = {
  start: number;
  end: number;
  duration: number;
  zone: string;
  result: string;
};
