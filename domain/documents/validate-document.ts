import { isZoneId } from "../zones/zone-identity.ts";
import { isRecord, isTimestamp, isIdentifier } from "../shared/validation.ts";
import { isCalendarDate, parseRiverDateTime } from "../shared/river-time.ts";
import { getAppDateTime, getAppNow } from "../shared/app-clock.ts";
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
    if (
      value &&
      ((field.type === "date" && !isCalendarDate(value)) ||
        (field.type === "datetime-local" && !Number.isFinite(parseRiverDateTime(value))))
    )
      return `Kontroller ${field.label.toLowerCase()}.`;
  }
  if (
    kind === "permit" &&
    parseRiverDateTime(values.startsAt ?? "") >= parseRiverDateTime(values.endsAt ?? "")
  )
    return "Sluttid må være etter starttid.";
  if (kind === "disinfection") {
    if (checkDate && parseRiverDateTime(values.performedAt ?? "") > getAppNow())
      return "Desinfisering kan ikke være utført i fremtiden.";
    if (
      values.otherRiverAt &&
      (parseRiverDateTime(values.otherRiverAt) < parseRiverDateTime(values.performedAt ?? "") ||
        (checkDate && parseRiverDateTime(values.otherRiverAt) > getAppNow()))
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
  if (!isRecord(value)) return false;
  const record = value as Record<string, unknown>;
  if (
    typeof record.id !== "string" ||
    !record.id ||
    !["permit", "disinfection", "fee"].includes(String(record.kind))
  )
    return false;
  if (
    ["purchaseId", "productId", "rulesVersion"].some(
      (key) => record[key] !== undefined && !isIdentifier(record[key]),
    )
  )
    return false;
  if (record.zoneId !== undefined && (record.kind !== "permit" || !isZoneId(record.zoneId)))
    return false;
  if (record.derivedAccess !== undefined && typeof record.derivedAccess !== "boolean") return false;
  if (record.verification !== undefined) {
    const verification = record.verification;
    if (!isRecord(verification)) return false;
    if (verification.method !== "manual") {
      if (!isTimestamp(verification.verifiedAt)) return false;
      if (verification.method === "disinfector-approved") {
        if (!isIdentifier(verification.verifierName) || !isIdentifier(verification.verifierRole))
          return false;
      } else if (verification.method !== "permit-purchase") return false;
    }
  }
  if (
    typeof record.updatedAt !== "number" ||
    !isTimestamp(record.updatedAt) ||
    !record.values ||
    !isRecord(record.values)
  )
    return false;
  if (record.forOtherPerson !== undefined && typeof record.forOtherPerson !== "boolean")
    return false;
  if (record.ownerEmail !== undefined && typeof record.ownerEmail !== "string") return false;
  if (
    record.accessGrants !== undefined &&
    (!Array.isArray(record.accessGrants) ||
      !record.accessGrants.every(
        (grant) =>
          grant &&
          isIdentifier(grant.id) &&
          typeof grant.recipientName === "string" &&
          typeof grant.recipientEmail === "string" &&
          ["guest", "warden"].includes(grant.role) &&
          typeof grant.startsAt === "string" &&
          typeof grant.endsAt === "string" &&
          parseRiverDateTime(grant.startsAt) < parseRiverDateTime(grant.endsAt) &&
          isTimestamp(grant.createdAt) &&
          (grant.revokedAt === undefined || isTimestamp(grant.revokedAt)),
      ))
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
