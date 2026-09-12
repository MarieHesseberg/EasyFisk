import { documentFields } from "../domain/documents/document-fields.ts";
import { translateContent, type AppLanguage } from "../locales/index.ts";

export function localizeDocumentError(message: string, language: AppLanguage) {
  if (language === "no") return translateContent(language, message);
  for (const field of Object.values(documentFields).flat()) {
    const label = translateContent(language, field.label);
    const lower = field.label.toLowerCase();
    if (message === `Fyll ut ${lower}.`) return `Fill in ${label.toLowerCase()}.`;
    if (message === `Velg ${lower}.`) return `Choose ${label.toLowerCase()}.`;
    if (message === `Kontroller ${lower}.`) return `Check ${label.toLowerCase()}.`;
    if (message === `${field.label} er for langt (maks 500 tegn).`)
      return `${label} is too long (maximum 500 characters).`;
  }
  return translateContent(language, message);
}
