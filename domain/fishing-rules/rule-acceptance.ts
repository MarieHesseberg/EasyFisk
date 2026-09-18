import { mandalselvaRules2026 } from "./mandalselva-2026-08-01.ts";
import { getAppNow } from "../shared/app-clock.ts";
export const ruleVersions = { "mandalselva-2026-08-01": mandalselvaRules2026 } as const;
export const currentRuleVersion = "mandalselva-2026-08-01";
export type RuleAcceptance = { version: string; acceptedAt: number; person: string };
const key = "easyfisk-rule-acceptances-v1";
function person() {
  try {
    const profile = JSON.parse(localStorage.getItem("easyfisk-profile-v1") ?? "{}");
    return String(profile.email || "local-profile")
      .trim()
      .toLowerCase();
  } catch {
    return "local-profile";
  }
}
export function readRuleAcceptances(): RuleAcceptance[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.filter(
      (r): r is RuleAcceptance =>
        !!r &&
        typeof r.version === "string" &&
        typeof r.person === "string" &&
        Number.isFinite(r.acceptedAt),
    );
  } catch {
    return [];
  }
}
export function hasAcceptedCurrentRules() {
  return readRuleAcceptances().some(
    (r) => r.person === person() && r.version === currentRuleVersion,
  );
}
export function hasPreviousRuleAcceptance() {
  return readRuleAcceptances().some(
    (r) => r.person === person() && r.version !== currentRuleVersion,
  );
}
export function acceptCurrentRules() {
  if (hasAcceptedCurrentRules()) return;
  localStorage.setItem(
    key,
    JSON.stringify([
      ...readRuleAcceptances(),
      { version: currentRuleVersion, person: person(), acceptedAt: getAppNow() },
    ]),
  );
}
