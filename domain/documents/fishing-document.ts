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

export type DocumentVerification =
  | { method: "manual" }
  | { method: "permit-purchase"; verifiedAt: number }
  | {
      method: "disinfector-approved";
      verifierName: string;
      verifierRole: string;
      verifiedAt: number;
    };

export interface FishingDocument {
  id: string;
  kind: DocumentKind;
  values: DocumentValues;
  updatedAt: number;
  attachment?: Blob;
  attachmentName?: string;
  purchaseId?: string;
  verification?: DocumentVerification;
}

export const documentTitles: Record<DocumentKind, string> = {
  permit: "Fiskekort",
  disinfection: "Desinfisering",
  fee: "Statlig fiskeravgift",
};

export const documentAttachmentTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
export const maximumDocumentBytes = 10 * 1024 * 1024;
