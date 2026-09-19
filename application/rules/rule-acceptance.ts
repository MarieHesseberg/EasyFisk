import { getDefaultAppServices } from "@/data/runtime/services";
export { currentRuleVersion, ruleVersions } from "@/domain/fishing-rules/rule-acceptance";
export function hasAcceptedCurrentRules() {
  try {
    return getDefaultAppServices().ruleAcceptances.hasCurrent();
  } catch {
    return false;
  }
}
export function hasPreviousRuleAcceptance() {
  try {
    return getDefaultAppServices().ruleAcceptances.hasPrevious();
  } catch {
    return false;
  }
}
export function readRuleAcceptances() {
  return getDefaultAppServices().ruleAcceptances.read();
}
export function acceptCurrentRules() {
  getDefaultAppServices().ruleAcceptances.accept();
}
