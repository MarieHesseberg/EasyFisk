"use client";

import { useEffect, useState } from "react";
import type { FishingLogRepository } from "@/data/contracts/fishing-log-repository";
import type { CatchRecord } from "@/domain/catches/catch";
import { completeCatchRecord } from "@/domain/catches/complete-catch-record";
import type { SessionRecord } from "@/domain/sessions/session";
import { operationFailed, operationSucceeded } from "@/domain/shared/operation-result";
import { logger } from "@/lib/logger";

export function useFishingLogController(repository: FishingLogRepository) {
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [lastSession, setLastSession] = useState<SessionRecord | null>(null);

  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (!isMounted) return;
      setCatches(repository.listCatches());
      setLastSession(repository.getLatestSession());
    });
    return () => {
      isMounted = false;
    };
  }, [repository]);

  function saveCatch(record: CatchRecord) {
    const submittedAt = Date.now();
    const completed = completeCatchRecord(record, `ME-${submittedAt}`, submittedAt);
    const result = repository.saveCatch(completed);
    if (!result.ok) {
      logger.error(result.error, { cause: result.cause });
      return operationFailed(result.error, result.cause);
    }
    setCatches((current) => [...current, completed]);
    return operationSucceeded(completed);
  }

  function savePastSession(session: SessionRecord, records: CatchRecord[] = []) {
    return saveCompletedSession(session, records, false);
  }

  function saveCompletedSession(
    session: SessionRecord,
    records: CatchRecord[] = [],
    clearActiveSession = true,
  ) {
    const submittedAt = Date.now();
    const completed = records.map((record, index) =>
      completeCatchRecord(
        record,
        record.id === "pending" ? `ME-${submittedAt}-${index + 1}` : record.id,
        submittedAt,
      ),
    );
    const result = repository.saveCompletedSession(session, completed, clearActiveSession);
    if (!result.ok) {
      logger.error(result.error, { cause: result.cause });
      return operationFailed(result.error, result.cause);
    }
    setLastSession(session);
    if (completed.length) setCatches((current) => [...current, ...completed]);
    return operationSucceeded(completed);
  }

  function correctCatch(id: string, note: string) {
    const result = repository.updateCatchCorrection(id, note);
    if (!result.ok) {
      logger.error(result.error, { cause: result.cause });
      return result;
    }
    setCatches((current) =>
      current.map((record) => (record.id === id ? { ...record, correction: note } : record)),
    );
    return result;
  }

  return {
    state: { catches, lastSession },
    actions: { correctCatch, saveCatch, saveCompletedSession, savePastSession },
  };
}
