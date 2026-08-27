import type { DemoScenario, DemoStatus } from "./rule";

export function findDemoStatus(status: DemoStatus, scenarios: readonly DemoScenario[]) {
  return scenarios.find((item) => item.id === status) ?? scenarios[0];
}
