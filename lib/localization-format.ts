import { dateForDisplay, riverTimeZone } from "../domain/shared/river-time.ts";
import type { AppLanguage, TranslationKey, TranslationVariables } from "../locales/index.ts";
import { t } from "../locales/index.ts";

const localeTags: Record<AppLanguage, string> = { no: "nb-NO", en: "en-GB" };
const defaultTimeZone = riverTimeZone;

export function getLocaleTag(language: AppLanguage) {
  return localeTags[language];
}

export function formatNumber(
  value: number,
  language: AppLanguage,
  options: Intl.NumberFormatOptions = {},
) {
  return new Intl.NumberFormat(getLocaleTag(language), options).format(value);
}

export function formatDecimal(value: number, language: AppLanguage, maximumFractionDigits = 1) {
  return formatNumber(value, language, { maximumFractionDigits });
}

export function formatCurrencyNok(value: number, language: AppLanguage) {
  return formatNumber(value, language, {
    style: "currency",
    currency: "NOK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatDate(
  value: Date | number | string,
  language: AppLanguage,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
) {
  return new Intl.DateTimeFormat(getLocaleTag(language), {
    timeZone: defaultTimeZone,
    ...options,
  }).format(asDate(value));
}

export function formatTime(value: Date | number | string, language: AppLanguage) {
  return formatDate(value, language, { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDateTime(value: Date | number | string, language: AppLanguage) {
  return formatDate(value, language, { dateStyle: "short", timeStyle: "short" });
}

export function formatDurationValue(seconds: number, language: AppLanguage) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const remainingSeconds = safeSeconds % 60;
  if (hours)
    return `${formatUnit(hours, "hour", language)} ${formatUnit(minutes, "minute", language)}`;
  if (minutes)
    return `${formatUnit(minutes, "minute", language)} ${formatUnit(remainingSeconds, "second", language)}`;
  return formatUnit(remainingSeconds, "second", language);
}

export function formatPlural(
  count: number,
  language: AppLanguage,
  forms: Readonly<{ one: string; other: string }>,
) {
  const form =
    new Intl.PluralRules(getLocaleTag(language)).select(count) === "one" ? forms.one : forms.other;
  return form.replaceAll("{count}", formatNumber(count, language));
}

export function formatTranslated(
  language: AppLanguage,
  key: TranslationKey,
  variables: TranslationVariables = {},
) {
  return t(language, key, variables);
}

function formatUnit(value: number, unit: "hour" | "minute" | "second", language: AppLanguage) {
  return formatNumber(value, language, { style: "unit", unit, unitDisplay: "short" });
}

function asDate(value: Date | number | string) {
  return typeof value === "string"
    ? dateForDisplay(value)
    : value instanceof Date
      ? value
      : new Date(value);
}
