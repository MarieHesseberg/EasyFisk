import { t, translateContent, type AppLanguage } from "../locales/index.ts";

/** Localize a zone label while preserving place names and saved subzones. */
export function localizeZoneName(zone: string, language: AppLanguage) {
  const translated = translateContent(language, zone);
  return translated.replace(/^Sone ([1-4])(?= ·|$)/, (_match, number: string) =>
    t(language, "common.zone", { number }),
  );
}
