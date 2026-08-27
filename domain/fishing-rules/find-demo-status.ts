import { demoStatuses } from "@/data/mock/fishing-data";
import type { DemoStatus } from "@/domain/models";

export function findDemoStatus(status: DemoStatus) {
  return demoStatuses.find((item) => item.id === status) ?? demoStatuses[0];
}
