import type { CatchRecord } from "@/domain/models";
import { isReportLate } from "@/domain/catches/reporting-deadline";

export function completeCatchRecord(record: CatchRecord, id: string, submittedAt: number) {
  return {
    ...record,
    id,
    submittedAt,
    late: isReportLate(record.caughtAt, submittedAt),
  };
}
