import {
  currentRuleVersion,
  type RuleAcceptance,
} from "../../domain/fishing-rules/rule-acceptance";
import type { KeyValueStorage } from "../contracts/key-value-storage";
const key = "easyfisk-rule-acceptances-v1";
export function createLocalRuleAcceptances(
  storage: KeyValueStorage,
  person: () => string,
  now: () => number,
) {
  function read(): RuleAcceptance[] {
    const value: unknown = JSON.parse(storage.getItem(key) ?? "[]");
    if (!Array.isArray(value)) throw new Error("Invalid rule acceptance history");
    return value.filter(
      (r): r is RuleAcceptance =>
        !!r &&
        typeof r.version === "string" &&
        typeof r.person === "string" &&
        Number.isFinite(r.acceptedAt),
    );
  }
  return {
    read,
    hasCurrent: () => read().some((r) => r.person === person() && r.version === currentRuleVersion),
    hasPrevious: () =>
      read().some((r) => r.person === person() && r.version !== currentRuleVersion),
    accept() {
      const records = read();
      if (records.some((r) => r.person === person() && r.version === currentRuleVersion)) return;
      storage.setItem(
        key,
        JSON.stringify([
          ...records,
          { version: currentRuleVersion, person: person(), acceptedAt: now() },
        ]),
      );
    },
  };
}
