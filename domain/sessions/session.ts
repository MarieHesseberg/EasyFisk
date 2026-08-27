export type FlowMode = "start" | "stop" | "summary";
export type SessionRecord = {
  start: number;
  end: number;
  duration: number;
  zone: string;
  result: string;
};
