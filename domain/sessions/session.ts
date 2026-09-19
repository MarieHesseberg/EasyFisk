export type FlowMode = "start" | "stop" | "summary";
export type ActiveSessionSnapshot = {
  id?: string;
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
  zoneId?: import("../zones/zone").ZoneId;
  result: string;
  subzone?: string;
};
