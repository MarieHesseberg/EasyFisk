import type { KeyValueStorage } from "../contracts/key-value-storage";
import type { FishingLogRepository } from "../contracts/fishing-log-repository";
import type { CatchRecord } from "../../domain/catches/catch";
import type { SessionRecord } from "../../domain/sessions/session";

const defaultStorageKey = "easyfisk:fishing-log:v1";

type StoredFishingLog = {
  version: 1;
  catches: CatchRecord[];
  latestSession: SessionRecord | null;
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
    storage.setItem(key, JSON.stringify(change(readLog(storage, key))));
  };

  return {
    getLatestSession: () => readLog(storage, key).latestSession,
    listCatches: () => [...readLog(storage, key).catches],
    saveCatch: (record) =>
      update((current) => ({ ...current, catches: [...current.catches, record] })),
    saveSession: (record) => update((current) => ({ ...current, latestSession: record })),
    updateCatchCorrection: (id, note) =>
      update((current) => ({
        ...current,
        catches: current.catches.map((record) =>
          record.id === id ? { ...record, correction: note } : record,
        ),
      })),
  };
}
