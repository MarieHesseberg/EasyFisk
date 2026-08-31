import type { PermitReportingDay } from "../../domain/fishing-permits/permit-reporting-day.ts";
import type { OperationResult } from "../../domain/shared/operation-result.ts";

export interface PermitReportingRepository {
  list(): OperationResult<PermitReportingDay[]>;
  save(record: PermitReportingDay): OperationResult<void>;
}
