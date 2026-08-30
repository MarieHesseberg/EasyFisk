import { DocumentsPanel } from "@/features/documents/documents-panel";
import type { FishingDocument } from "@/domain/documents/fishing-document";

export function PermitsDetail({ testDocument }: { testDocument?: FishingDocument | null }) {
  return <DocumentsPanel kind="permit" testDocument={testDocument} />;
}
