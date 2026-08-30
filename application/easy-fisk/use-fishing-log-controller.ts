"use client";

import { useEffect, useState } from "react";
import type { FishingLogRepository } from "@/data/contracts/fishing-log-repository";
import type { CatchRecord } from "@/domain/catches/catch";
import { completeCatchRecord } from "@/domain/catches/complete-catch-record";
import type { SessionRecord } from "@/domain/sessions/session";
import { operationFailed, operationSucceeded } from "@/domain/shared/operation-result";
import { logger } from "@/lib/logger";
import type { CatchImageRepository } from "@/data/contracts/catch-image-repository";
import { catchImageRepository } from "@/data/repositories/catch-images";

export function useFishingLogController(
  repository: FishingLogRepository,
  imageRepository: CatchImageRepository = catchImageRepository,
) {
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    let isMounted = true;
    queueMicrotask(() => {
      if (!isMounted) return;
      const storedCatches = repository.listCatches();
      setCatches(storedCatches);
      setSessions(repository.listSessions());
      void hydrateCatchImages(storedCatches, imageRepository).then((hydrated) => {
        if (!isMounted) return;
        const hydratedById = new Map(hydrated.map((record) => [record.id, record]));
        setCatches((current) =>
          current.map((record) => {
            const stored = hydratedById.get(record.id);
            return stored?.imageData ? { ...record, imageData: stored.imageData } : record;
          }),
        );
      });
    });
    return () => {
      isMounted = false;
    };
  }, [imageRepository, repository]);

  async function saveCatch(record: CatchRecord) {
    const submittedAt = Date.now();
    const completed = completeCatchRecord(record, `ME-${submittedAt}`, submittedAt);
    const imageResult = await saveCatchImages([completed], imageRepository);
    if (!imageResult.ok) return imageResult;
    const result = repository.saveCatch(completed);
    if (!result.ok) {
      await removeCatchImages(imageResult.value, imageRepository);
      logger.error(result.error, { cause: result.cause });
      return operationFailed(result.error, result.cause);
    }
    setCatches((current) => [...current, completed]);
    return operationSucceeded(completed);
  }

  async function savePastSession(session: SessionRecord, records: CatchRecord[] = []) {
    return saveCompletedSession(session, records, false);
  }

  async function saveCompletedSession(
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
    const imageResult = await saveCatchImages(completed, imageRepository);
    if (!imageResult.ok) return imageResult;
    const result = repository.saveCompletedSession(session, completed, clearActiveSession);
    if (!result.ok) {
      await removeCatchImages(imageResult.value, imageRepository);
      logger.error(result.error, { cause: result.cause });
      return operationFailed(result.error, result.cause);
    }
    setSessions((current) => [session, ...current.filter((record) => record.id !== session.id)]);
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
    state: { catches, lastSession: sessions[0] ?? null, sessions },
    actions: { correctCatch, saveCatch, saveCompletedSession, savePastSession },
  };
}

async function hydrateCatchImages(
  catches: CatchRecord[],
  repository: CatchImageRepository,
): Promise<CatchRecord[]> {
  return Promise.all(
    catches.map(async (record) => {
      if (!record.imageId) return record;
      const result = await repository.get(record.imageId);
      return result.ok && result.value ? { ...record, imageData: result.value } : record;
    }),
  );
}

async function saveCatchImages(records: CatchRecord[], repository: CatchImageRepository) {
  const savedIds: string[] = [];
  for (const record of records) {
    if (!record.imageId || !record.imageData) continue;
    const result = await repository.save(record.imageId, record.imageData);
    if (!result.ok) {
      await removeCatchImages(savedIds, repository);
      return result;
    }
    savedIds.push(record.imageId);
  }
  return operationSucceeded(savedIds);
}

async function removeCatchImages(ids: string[], repository: CatchImageRepository) {
  await Promise.all(ids.map((id) => repository.remove(id)));
}
