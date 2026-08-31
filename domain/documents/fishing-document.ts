import type { PermitPurchaseMetadata } from "../fishing-permits/permit-purchase.ts";

export type DocumentKind = "permit" | "disinfection" | "fee";

export type DocumentField =
  | "holder"
  | "reference"
  | "issuer"
  | "category"
  | "area"
  | "startsAt"
  | "endsAt"
  | "reportNumber"
  | "performedAt"
  | "equipment"
  | "otherRiverAt"
  | "year"
  | "paidAt";

export type DocumentValues = Partial<Record<DocumentField, string>>;

export interface FishingDocument {
  id: string;
  kind: DocumentKind;
  values: DocumentValues;
  updatedAt: number;
  attachment?: Blob;
  attachmentName?: string;
  purchase?: PermitPurchaseMetadata;
}

export const documentTitles: Record<DocumentKind, string> = {
  permit: "Fiskekort",
  disinfection: "Desinfisering",
  fee: "Statlig fiskeravgift",
};

export const documentAttachmentTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const maximumDocumentBytes = 10 * 1024 * 1024;
