"use client";
import { useCallback, useState } from "react";
import { useAppServices } from "@/data/runtime/services-provider";
import { useRepositoryQuery } from "@/hooks/use-repository-query";
import type { PermitReportingDay } from "@/domain/fishing-permits/permit-reporting-day";
import { technicalOperationFailed } from "@/domain/shared/operation-result";
export function usePermitReportingDays() {
  const { reportingDays: repository } = useAppServices();
  const [error, setError] = useState("");
  const read = useCallback(async () => {
    const result = await repository.list();
    if (!result.ok) throw new Error(result.error);
    return result.value;
  }, [repository]);
  const query = useRepositoryQuery<PermitReportingDay[]>(read, []);
  async function save(record: PermitReportingDay) {
    try {
      const result = await repository.save(record);
      setError(result.ok ? "" : result.error);
      if (result.ok) await query.reload();
      return result;
    } catch (cause) {
      setError("error.storage.write");
      return technicalOperationFailed("storage.write", cause);
    }
  }
  return { records: query.data, error: error || query.error, loading: query.loading, save };
}
