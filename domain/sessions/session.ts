export type FlowMode = "start" | "stop" | "summary";
export type ActiveSessionSnapshot = {
  startTime: number;
  zone: import("../zones/zone").ZoneId;
  subzone?: string;
};
export type SessionRecord = {
  id: string;
  start: number;
  end: number;
  duration: number;
  zone: string;
  result: string;
  subzone?: string;
};
