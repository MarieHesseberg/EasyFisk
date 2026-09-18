import type { CatchEdit, CatchEditable, CatchRecord } from "./catch.ts";
import { validateCatch } from "./validate-catch.ts";
import { getAppNow } from "../shared/app-clock.ts";
export function correctCatchRecord(record: CatchRecord, change: string | CatchEdit): CatchRecord {
  if (typeof change === "string") return { ...record, correction: change };
  const { species, result, length, weight, comment } = change.values;
  const validation = validateCatch(species, result, length, weight);
  if (
    !validation.detailsValid ||
    !["Laks", "Sjøørret", "Annen art"].includes(species) ||
    !["Gjenutsatt", "Avlivet"].includes(result) ||
    change.reason.trim().length < 5
  )
    throw new Error("Ugyldig rettelse");
  const before: CatchEditable = {
    species: record.species,
    result: record.result,
    length: record.length,
    weight: record.weight,
    comment: record.comment,
  };
  const after = { species, result, length, weight, comment };
  return {
    ...record,
    ...after,
    violation: validation.blocked,
    correction: change.reason.trim(),
    revisions: [
      ...(record.revisions ?? []),
      { changedAt: getAppNow(), before, after, reason: change.reason.trim() },
    ],
  };
}
