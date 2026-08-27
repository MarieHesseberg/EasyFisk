import { activeFishingRules } from "../fishing-rules/mandalselva-2026.ts";

export const reportingDeadlineMs = activeFishingRules.reporting.deadlineHours * 60 * 60 * 1000;

export function isReportLate(caughtAt: number, submittedAt: number) {
  return submittedAt - caughtAt > reportingDeadlineMs;
}
