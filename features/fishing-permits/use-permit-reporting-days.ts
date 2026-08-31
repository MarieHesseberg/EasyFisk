"use client";

import { useEffect, useState } from "react";
import { createLocalStoragePermitReportingRepository } from "@/data/local-storage/create-local-storage-permit-reporting-repository";
import type { PermitReportingDay } from "@/domain/fishing-permits/permit-reporting-day";

export function usePermitReportingDays() {
  const [records, setRecords] = useState<PermitReportingDay[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const result = createLocalStoragePermitReportingRepository(window.localStorage).list();
      if (result.ok) setRecords(result.value);
      else setError(result.error);
    });
    return () => {
      active = false;
    };
  }, []);

  function save(record: PermitReportingDay) {
    const repository = createLocalStoragePermitReportingRepository(window.localStorage);
    const result = repository.save(record);
    if (result.ok) {
      const refreshed = repository.list();
      if (refreshed.ok) setRecords(refreshed.value);
      setError("");
    } else setError(result.error);
    return result;
  }

  return { records, error, save };
}
