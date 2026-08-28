import type { KeyValueStorage } from "../contracts/key-value-storage";
import type { FishingLogRepository } from "../contracts/fishing-log-repository";
import type { CatchRecord } from "../../domain/catches/catch";
import type { ActiveSessionSnapshot, SessionRecord } from "../../domain/sessions/session";
import { operationFailed, operationSucceeded } from "../../domain/shared/operation-result.ts";

const defaultStorageKey = "easyfisk:fishing-log:v1";

type StoredFishingLog = {
  version: 1;
  catches: CatchRecord[];
  latestSession: SessionRecord | null;
  activeSession?: ActiveSessionSnapshot | null;
};

const emptyLog: StoredFishingLog = { version: 1, catches: [], latestSession: null };

function readLog(storage: KeyValueStorage, key: string): StoredFishingLog {
  try {
    const value = storage.getItem(key);
    if (!value) return emptyLog;
    const parsed = JSON.parse(value) as Partial<StoredFishingLog>;
    if (parsed.version !== 1 || !Array.isArray(parsed.catches)) return emptyLog;
    return {
      version: 1,
      catches: parsed.catches,
      latestSession: parsed.latestSession ?? null,
      activeSession: parsed.activeSession ?? null,
    };
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
    updateCatchCorrection: (id, note) =>
      update((current) => ({
        ...current,
        catches: current.catches.map((record) =>
          record.id === id ? { ...record, correction: note } : record,
        ),
      })),
  };
}
