import type { FishingLogRepository } from "../contracts/fishing-log-repository";
import type { CatchRecord } from "../../domain/catches/catch";
import type { SessionRecord } from "../../domain/sessions/session";

type InitialFishingLog = {
  catches?: CatchRecord[];
  latestSession?: SessionRecord | null;
};

/** Enkel adapter som senere kan erstattes av database eller API. */
export function createMemoryFishingLogRepository(
  initial: InitialFishingLog = {},
): FishingLogRepository {
  let catches = [...(initial.catches ?? [])];
  let latestSession = initial.latestSession ?? null;

  return {
    getLatestSession: () => latestSession,
    listCatches: () => [...catches],
    saveCatch: (record) => {
      catches = [...catches, record];
    },
    saveSession: (record) => {
      latestSession = record;
    },
    updateCatchCorrection: (id, note) => {
      catches = catches.map((record) =>
        record.id === id ? { ...record, correction: note } : record,
      );
    },
  };
}
