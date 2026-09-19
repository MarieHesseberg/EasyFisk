import { isFishingDocument } from "../../domain/documents/validate-document.ts";
import type { FishingDocument } from "../../domain/documents/fishing-document.ts";

/** Dataversjonen er uavhengig av IndexedDB-versjonen. Blob-vedlegg beholdes uendret. */
export function decodeDocument(value: unknown): FishingDocument {
  if (!value || typeof value !== "object") throw new TypeError("Invalid document");
  if ("schemaVersion" in value && value.schemaVersion !== 1)
    throw new TypeError("Unsupported document version");
  const { schemaVersion: _version, ...document } = value as Record<string, unknown>;
  void _version;
  if (!isFishingDocument(document)) throw new TypeError("Invalid document");
  return document;
}

export function encodeDocument(document: FishingDocument) {
  if (!isFishingDocument(document)) throw new TypeError("Invalid document");
  return { ...document, schemaVersion: 1 as const };
}
