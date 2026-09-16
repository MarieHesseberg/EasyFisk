import { DocumentsPanel } from "@/features/documents/documents-panel";
import type { FishingDocument } from "@/domain/documents/fishing-document";

export function DisinfectionDetail({ testDocument }: { testDocument?: FishingDocument | null }) {
  return <DocumentsPanel kind="disinfection" testDocument={testDocument} />;
}
