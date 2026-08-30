import { DocumentsPanel } from "@/features/documents/documents-panel";
import type { FishingDocument } from "@/domain/documents/fishing-document";

export function PermitsDetail({
  testDocument,
  openPermitShop,
}: {
  testDocument?: FishingDocument | null;
  openPermitShop?: () => void;
}) {
  return (
    <>
      {openPermitShop && (
        <button className="primary" onClick={openPermitShop}>
          Kjøp nytt fiskekort
        </button>
      )}
      <DocumentsPanel kind="permit" testDocument={testDocument} />
    </>
  );
}
