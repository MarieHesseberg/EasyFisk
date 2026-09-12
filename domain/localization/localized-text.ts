import type { AppLanguage } from "@/locales";

export type LocalizedText = Readonly<{ no: string; en: string }>;
export const localized = (no: string, en: string): LocalizedText => ({ no, en });
export const localizeText = (text: LocalizedText | string, language: AppLanguage) =>
  typeof text === "string" ? text : text[language];
