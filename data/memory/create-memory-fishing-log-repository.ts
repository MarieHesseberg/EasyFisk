import type { FishingLogRepository } from "../contracts/fishing-log-repository";
import type { CatchRecord } from "../../domain/catches/catch";
import type { ActiveSessionSnapshot, SessionRecord } from "../../domain/sessions/session";
import { operationSucceeded } from "../../domain/shared/operation-result.ts";

type InitialFishingLog = {
  catches?: CatchRecord[];
  latestSession?: SessionRecord | null;
  activeSession?: ActiveSessionSnapshot | null;
};

/** Enkel adapter som senere kan erstattes av database eller API. */
export function createMemoryFishingLogRepository(
  initial: InitialFishingLog = {},
): FishingLogRepository {
  let catches = [...(initial.catches ?? [])];
  let latestSession = initial.latestSession ?? null;
  let activeSession = initial.activeSession ?? null;

  return {
    getLatestSession: () => latestSession,
    getActiveSession: () => activeSession,
    listCatches: () => [...catches],
    saveCatch: (record) => {
      catches = [...catches, record];
      return operationSucceeded(undefined);
    },
    saveSession: (record) => {
      latestSession = record;
      return operationSucceeded(undefined);
    },
    saveActiveSession: (session) => {
      activeSession = session;
      return operationSucceeded(undefined);
    },
    updateCatchCorrection: (id, note) => {
      catches = catches.map((record) =>
        record.id === id ? { ...record, correction: note } : record,
      );
      return operationSucceeded(undefined);
    },
  };
}
