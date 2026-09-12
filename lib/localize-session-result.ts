import { translateContent, type AppLanguage } from "../locales/index.ts";
import { formatPlural } from "./localization-format.ts";

/** Les eldre, lokalt lagrede øktresultater uten å endre de lagrede dataene. */
export function localizeSessionResult(result: string, language: AppLanguage) {
  const match = /^(\d+) fangst(?:er)?( · etterregistrert)?$/.exec(result);
  if (!match || language === "no") return translateContent(language, result);
  const count = formatPlural(Number(match[1]), language, {
    one: "{count} catch",
    other: "{count} catches",
  });
  return match[2] ? `${count} · registered later` : count;
}
