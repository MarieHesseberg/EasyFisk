import { correctCatchRecord } from "../../domain/catches/correct-catch.ts";
import type { KeyValueStorage } from "../contracts/key-value-storage";
import type { FishingLogRepository } from "../contracts/fishing-log-repository";
import {
  operationSucceeded,
  technicalOperationFailed,
} from "../../domain/shared/operation-result.ts";
import { parseStoredFishingLog, type StoredFishingLog } from "./parse-persisted-data.ts";

const defaultStorageKey = "easyfisk:fishing-log:v1";

const emptyLog: StoredFishingLog = {
  version: 3,
  catches: [],
  sessions: [],
  activeSession: null,
};

function readLog(storage: KeyValueStorage, key: string): StoredFishingLog {
  const value = storage.getItem(key);
  if (!value) return emptyLog;
  const parsed = parseStoredFishingLog(JSON.parse(value));
  if (!parsed) throw new Error("Invalid saved fishing log");
  return parsed;
}

export function createLocalStorageFishingLogRepository(
  storage: KeyValueStorage,
  key = defaultStorageKey,
): FishingLogRepository {
  const update = (change: (current: StoredFishingLog) => StoredFishingLog) => {
    try {
      const updated = change(readLog(storage, key));
      if (!parseStoredFishingLog(updated)) return technicalOperationFailed("storage.invalid-data");
      storage.setItem(key, JSON.stringify(updated));
      return operationSucceeded(undefined);
    } catch (cause) {
      return technicalOperationFailed("storage.write", cause);
    }
  };

  return {
    listSessions: () => [...readLog(storage, key).sessions],
    getActiveSession: () => readLog(storage, key).activeSession ?? null,
    listCatches: () => [...readLog(storage, key).catches],
    saveCatch: (record) =>
      update((current) => ({
        ...current,
        catches: [...current.catches, prepareCatchForLocalStorage(record)],
      })),
    saveActiveSession: (session) => update((current) => ({ ...current, activeSession: session })),
    saveCompletedSession: (session, catches, clearActiveSession) =>
      update((current) => ({
        ...current,
        sessions: [session, ...current.sessions.filter((record) => record.id !== session.id)],
        catches: [...current.catches, ...catches.map(prepareCatchForLocalStorage)],
        activeSession: clearActiveSession ? null : current.activeSession,
      })),
    updateCatchCorrection: (id, note) =>
      update((current) => ({
        ...current,
        catches: current.catches.map((record) =>
          record.id === id ? correctCatchRecord(record, note) : record,
        ),
      })),
  };
}

function prepareCatchForLocalStorage(catchRecord: StoredFishingLog["catches"][number]) {
  const persistedRecord = { ...catchRecord };
  delete persistedRecord.imageData;
  return persistedRecord;
}
