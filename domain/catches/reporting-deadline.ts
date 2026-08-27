export const reportingDeadlineMs = 2 * 60 * 60 * 1000;

export function isReportLate(caughtAt: number, submittedAt: number) {
  return submittedAt - caughtAt > reportingDeadlineMs;
}
