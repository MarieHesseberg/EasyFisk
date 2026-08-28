import type { CatchRecord } from "../../domain/catches/catch";
import type { ActiveSessionSnapshot, SessionRecord } from "../../domain/sessions/session";
import type { OperationResult } from "../../domain/shared/operation-result";

/** Lagring av brukerens fiskeøkter og fangster. */
export interface FishingLogRepository {
  getLatestSession(): SessionRecord | null;
  listCatches(): CatchRecord[];
  getActiveSession(): ActiveSessionSnapshot | null;
  saveCatch(record: CatchRecord): OperationResult<void>;
  saveSession(record: SessionRecord): OperationResult<void>;
  saveActiveSession(session: ActiveSessionSnapshot | null): OperationResult<void>;
  updateCatchCorrection(id: string, note: string): OperationResult<void>;
}
