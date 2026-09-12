import { en } from "./en.ts";
import { no, type TranslationKey } from "./no.ts";

export const locales = { no, en } as const;

export type AppLanguage = keyof typeof locales;
export type { TranslationKey } from "./no";
export type TranslationVariables = Readonly<Record<string, string | number>>;

export function selectLocalized<T>(language: AppLanguage, norwegian: T, english: T): T {
  return language === "en" ? english : norwegian;
}

export function isTranslationKey(value: string): value is TranslationKey {
  return Object.prototype.hasOwnProperty.call(no, value);
}

// Repository-innhold beholder norske kildetekster. Slå bare opp hele, kjente
// tekster; aldri erstatt ord inne i navn eller brukerregistrerte opplysninger.
const contentKeys = new Map<string, TranslationKey>(
  Object.entries(no).map(([key, value]) => [value, key as TranslationKey]),
);

export function translateContent(
  language: AppLanguage,
  value: string,
  variables: TranslationVariables = {},
) {
  const key = isTranslationKey(value) ? value : contentKeys.get(value);
  return key ? t(language, key, variables) : value;
}

export function t(
  language: AppLanguage,
  key: TranslationKey,
  variables: TranslationVariables = {},
) {
  const template: string = locales[language][key];
  return template.replace(/\{([A-Za-z][A-Za-z0-9]*)\}/g, (placeholder, name: string) => {
    const value = variables[name];
    return value === undefined ? placeholder : String(value);
  });
}
