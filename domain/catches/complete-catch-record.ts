import type { CatchRecord } from "@/domain/models";

export function completeCatchRecord(record: CatchRecord, id: string, submittedAt: number) {
  return {
    ...record,
    id,
    submittedAt,
    late: submittedAt - record.caughtAt > 2 * 60 * 60 * 1000,
  };
}
