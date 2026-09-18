import { getAppDateTime } from "../shared/app-clock.ts";
import { documentFields } from "./document-fields.ts";
import {
  documentAttachmentTypes,
  maximumDocumentBytes,
  type DocumentKind,
  type DocumentValues,
  type FishingDocument,
} from "./fishing-document.ts";

export function validateDocument(
  kind: DocumentKind,
  values: DocumentValues,
  checkDate = true,
): string | undefined {
  for (const field of documentFields[kind]) {
    const value = values[field.key]?.trim();
    if (field.required && !value) return `Fyll ut ${field.label.toLowerCase()}.`;
    if (value && value.length > 500) return `${field.label} er for langt (maks 500 tegn).`;
    if (value && field.options && !field.options.includes(value))
      return `Velg ${field.label.toLowerCase()}.`;
    if (value && field.type?.includes("date") && !Number.isFinite(Date.parse(value)))
      return `Kontroller ${field.label.toLowerCase()}.`;
  }
  if (kind === "permit" && (values.startsAt ?? "") >= (values.endsAt ?? ""))
    return "Sluttid må være etter starttid.";
  if (kind === "disinfection") {
    if (checkDate && (values.performedAt ?? "") > getAppDateTime())
      return "Desinfisering kan ikke være utført i fremtiden.";
    if (
      values.otherRiverAt &&
      (values.otherRiverAt < (values.performedAt ?? "") ||
        (checkDate && values.otherRiverAt > getAppDateTime()))
    )
      return "Besøket må være etter desinfiseringen og ikke i fremtiden.";
  }
  if (kind === "fee") {
    if (!/^20\d{2}$/.test(values.year ?? "")) return "Oppgi et kalenderår mellom 2000 og 2099.";
    if (["Enkeltperson", "Familie"].includes(values.category ?? "") && !values.paidAt)
      return "Oppgi betalingsdato fra kvitteringen.";
    if (
      values.paidAt &&
      ((checkDate && values.paidAt > getAppDateTime().slice(0, 10)) ||
        !values.paidAt.startsWith(values.year ?? ""))
    )
      return "Betalingsdato må være i avgiftsåret og ikke i fremtiden.";
  }
}

export function attachmentError(file: Blob): string | undefined {
  if (!documentAttachmentTypes.includes(file.type))
    return "Velg JPG, PNG, WebP eller PDF. HEIC må først eksporteres som JPG.";
  if (file.size === 0 || file.size > maximumDocumentBytes)
    return "Vedlegget må være mellom 1 byte og 10 MB.";
}

export function isFishingDocument(value: unknown): value is FishingDocument {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    !record.id ||
    !["permit", "disinfection", "fee"].includes(String(record.kind))
  )
    return false;
  if (record.purchaseId !== undefined && typeof record.purchaseId !== "string") return false;
  if (
    typeof record.updatedAt !== "number" ||
    !Number.isFinite(record.updatedAt) ||
    !record.values ||
    typeof record.values !== "object"
  )
    return false;
  const fields = record.values as Record<string, unknown>;
  const kind = record.kind as DocumentKind;
  if (
    !Object.entries(fields).every(
      ([key, field]) =>
        documentFields[kind].some((definition) => definition.key === key) &&
        typeof field === "string" &&
        field.length <= 500,
    )
  )
    return false;
  // Gamle dokumenter beholdes også etter at datoene har utløpt.
  if (documentFields[kind].some((field) => field.required && !fields[field.key])) return false;
  if (validateDocument(kind, fields as DocumentValues, false)) return false;
  if (
    record.attachment !== undefined &&
    (!(record.attachment instanceof Blob) || attachmentError(record.attachment))
  )
    return false;
  return record.attachmentName === undefined || typeof record.attachmentName === "string";
}
