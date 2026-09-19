import type { CatchRecord } from "../catches/catch";
import type { SessionRecord } from "./session";

/** ID brukes først. Tidsstempel er bare reserve for eldre prototypedata uten kobling. */
export function catchBelongsToSession(
  record: Pick<CatchRecord, "sessionId" | "sessionStart">,
  session: Pick<SessionRecord, "id" | "start">,
) {
  return record.sessionId ? record.sessionId === session.id : record.sessionStart === session.start;
}
