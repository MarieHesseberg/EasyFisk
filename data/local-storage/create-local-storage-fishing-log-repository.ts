import type { KeyValueStorage } from "../contracts/key-value-storage";
import type { FishingLogRepository } from "../contracts/fishing-log-repository";
import { operationFailed, operationSucceeded } from "../../domain/shared/operation-result.ts";
import { parseStoredFishingLog, type StoredFishingLog } from "./parse-persisted-data.ts";

const defaultStorageKey = "easyfisk:fishing-log:v1";

const emptyLog: StoredFishingLog = {
  version: 1,
  catches: [],
  latestSession: null,
  activeSession: null,
};

function readLog(storage: KeyValueStorage, key: string): StoredFishingLog {
  try {
    const value = storage.getItem(key);
    if (!value) return emptyLog;
    return parseStoredFishingLog(JSON.parse(value)) ?? emptyLog;
  } catch {
    return emptyLog;
  }
}

export function createLocalStorageFishingLogRepository(
  storage: KeyValueStorage,
  key = defaultStorageKey,
): FishingLogRepository {
  const update = (change: (current: StoredFishingLog) => StoredFishingLog) => {
    try {
      storage.setItem(key, JSON.stringify(change(readLog(storage, key))));
      return operationSucceeded(undefined);
    } catch (cause) {
      return operationFailed("Kunne ikke lagre fiskedata på enheten.", cause);
    }
  };

  return {
    getLatestSession: () => readLog(storage, key).latestSession,
    getActiveSession: () => readLog(storage, key).activeSession ?? null,
    listCatches: () => [...readLog(storage, key).catches],
    saveCatch: (record) =>
      update((current) => ({ ...current, catches: [...current.catches, record] })),
    saveSession: (record) => update((current) => ({ ...current, latestSession: record })),
    saveActiveSession: (session) => update((current) => ({ ...current, activeSession: session })),
    saveCompletedSession: (session, catches, clearActiveSession) =>
      update((current) => ({
        ...current,
        latestSession: session,
        catches: [...current.catches, ...catches],
        activeSession: clearActiveSession ? null : current.activeSession,
      })),
    updateCatchCorrection: (id, note) =>
      update((current) => ({
        ...current,
        catches: current.catches.map((record) =>
          record.id === id ? { ...record, correction: note } : record,
        ),
      })),
  };
}
