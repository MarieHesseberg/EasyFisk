import { mandalselvaRules2026 } from "./mandalselva-2026-08-01.ts";
export const ruleVersions = { "mandalselva-2026-08-01": mandalselvaRules2026 } as const;
export const currentRuleVersion = "mandalselva-2026-08-01";
export type RuleAcceptance = { version: string; acceptedAt: number; person: string };
