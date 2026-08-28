"use client";

import { useEffect, useState } from "react";
import type { FishingLogRepository } from "@/data/contracts/fishing-log-repository";
import type { CatchRecord } from "@/domain/catches/catch";
import { completeCatchRecord } from "@/domain/catches/complete-catch-record";
import type { SessionRecord } from "@/domain/sessions/session";

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

  function saveSession(session: SessionRecord) {
    repository.saveSession(session);
    setLastSession(session);
  }

  function saveCatch(record: CatchRecord) {
    const submittedAt = Date.now();
    const completed = completeCatchRecord(record, `ME-${submittedAt}`, submittedAt);
    repository.saveCatch(completed);
    setCatches((current) => [...current, completed]);
    return completed;
  }

  function savePastSession(session: SessionRecord, records: CatchRecord[] = []) {
    saveSession(session);
    const submittedAt = Date.now();
    const completed = records.map((record, index) =>
      completeCatchRecord(
        record,
        record.id === "pending" ? `ME-${submittedAt}-${index + 1}` : record.id,
        submittedAt,
      ),
    );
    completed.forEach(repository.saveCatch);
    if (completed.length) setCatches((current) => [...current, ...completed]);
  }

  function correctCatch(id: string, note: string) {
    repository.updateCatchCorrection(id, note);
    setCatches((current) =>
      current.map((record) => (record.id === id ? { ...record, correction: note } : record)),
    );
  }

  return {
    state: { catches, lastSession },
    actions: { correctCatch, saveCatch, savePastSession, saveSession },
  };
}
