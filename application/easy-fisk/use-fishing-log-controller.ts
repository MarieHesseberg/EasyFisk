"use client";
import { createId } from "@/domain/shared/create-id";
import { zoneIdFromLegacyLabel } from "@/domain/zones/zone-identity";
import { getAppNow } from "@/domain/shared/app-clock";

import { useEffect, useState, useRef } from "react";
import type { AsyncRepository } from "@/data/contracts/async-repository";
import { technicalOperationFailed } from "@/domain/shared/operation-result";
import type { FishingLogRepository } from "@/data/contracts/fishing-log-repository";
import type { CatchEdit, CatchRecord } from "@/domain/catches/catch";
import { completeCatchRecord } from "@/domain/catches/complete-catch-record";
import type { SessionRecord } from "@/domain/sessions/session";
import { operationFailed, operationSucceeded } from "@/domain/shared/operation-result";
import { logger } from "@/lib/logger";
import type { CatchImageRepository } from "@/data/contracts/catch-image-repository";
import { useAppServices } from "@/data/runtime/services-provider";

export function useFishingLogController(
  repository: FishingLogRepository | AsyncRepository<FishingLogRepository>,
  images?: CatchImageRepository,
) {
  const services = useAppServices();
  const imageRepository = images ?? services.catchImages;
  const generation = useRef(0);
  const writing = useRef(false);
  const [logLoading, setLoading] = useState(true);
  const [logError, setError] = useState("");
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  useEffect(() => {
    let isMounted = true;
    const request = ++generation.current;
    queueMicrotask(() => {
      if (isMounted) setLoading(true);
    });
    Promise.all([
      Promise.resolve().then(() => repository.listCatches()),
      Promise.resolve().then(() => repository.listSessions()),
    ])
      .then(async ([storedCatches, storedSessions]) => {
        if (!isMounted || request !== generation.current) return;
        setError("");
        setCatches(storedCatches);
        setSessions(storedSessions);
        const hydrated = await hydrateCatchImages(storedCatches, imageRepository);
        if (!isMounted || request !== generation.current) return;
        setCatches(hydrated);
      })
      .catch(() => {
        if (isMounted && request === generation.current) setError("error.storage.read");
      })
      .finally(() => {
        if (isMounted && request === generation.current) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [imageRepository, repository]);

  async function saveCatch(record: CatchRecord) {
    const submittedAt = getAppNow();
    const completed = completeCatchRecord(record, `ME-${createId()}`, submittedAt);
    const imageResult = await saveCatchImages([completed], imageRepository);
    if (!imageResult.ok) return imageResult;
    const result = await captureWrite(() => repository.saveCatch(completed));
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
    const submittedAt = getAppNow();
    const completed = records.map((record) =>
      completeCatchRecord(
        {
          ...record,
          sessionId: session.id,
          zoneId: session.zoneId ?? zoneIdFromLegacyLabel(record.zone),
        },
        record.id === "pending" ? `ME-${createId()}` : record.id,
        submittedAt,
      ),
    );
    const imageResult = await saveCatchImages(completed, imageRepository);
    if (!imageResult.ok) return imageResult;
    const result = await captureWrite(() =>
      repository.saveCompletedSession(session, completed, clearActiveSession),
    );
    if (!result.ok) {
      await removeCatchImages(imageResult.value, imageRepository);
      logger.error(result.error, { cause: result.cause });
      return operationFailed(result.error, result.cause);
    }
    setSessions((current) => [session, ...current.filter((record) => record.id !== session.id)]);
    if (completed.length) setCatches((current) => [...current, ...completed]);
    return operationSucceeded(completed);
  }

  async function correctCatch(id: string, note: string | CatchEdit) {
    const result = await repository.updateCatchCorrection(id, note);
    if (!result.ok) {
      logger.error(result.error, { cause: result.cause });
      return result;
    }
    const stored = await repository.listCatches();
    setCatches((current) =>
      current.map((record) =>
        record.id === id ? { ...record, ...stored.find((saved) => saved.id === id) } : record,
      ),
    );
    return result;
  }

  async function guarded<T>(action: () => Promise<T>) {
    if (logLoading || logError) return operationFailed("error.storage.read");
    if (writing.current) return operationFailed("error.storage.write");
    writing.current = true;
    generation.current += 1;
    try {
      return await action();
    } catch (cause) {
      return technicalOperationFailed("storage.write", cause);
    } finally {
      writing.current = false;
    }
  }
  return {
    state: { logLoading, logError, catches, lastSession: sessions[0] ?? null, sessions },
    actions: {
      correctCatch: (...args: Parameters<typeof correctCatch>) =>
        guarded(() => correctCatch(...args)),
      saveCatch: (...args: Parameters<typeof saveCatch>) => guarded(() => saveCatch(...args)),
      saveCompletedSession: (...args: Parameters<typeof saveCompletedSession>) =>
        guarded(() => saveCompletedSession(...args)),
      savePastSession: (...args: Parameters<typeof savePastSession>) =>
        guarded(() => savePastSession(...args)),
    },
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

async function captureWrite(
  action: () => import("@/domain/shared/operation-result").AsyncOperationResult<void>,
) {
  try {
    return await action();
  } catch (cause) {
    return technicalOperationFailed("storage.write", cause);
  }
}
