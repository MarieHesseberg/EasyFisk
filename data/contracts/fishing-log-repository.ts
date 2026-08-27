import type { CatchRecord } from "../../domain/catches/catch";
import type { SessionRecord } from "../../domain/sessions/session";

/** Lagring av brukerens fiskeøkter og fangster. */
export interface FishingLogRepository {
  getLatestSession(): SessionRecord | null;
  listCatches(): CatchRecord[];
  saveCatch(record: CatchRecord): void;
  saveSession(record: SessionRecord): void;
  updateCatchCorrection(id: string, note: string): void;
}
