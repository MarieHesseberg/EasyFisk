import { DocumentsPanel } from "@/features/documents/documents-panel";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { useLanguage } from "@/components/localization/language-provider";

export function PermitsDetail({
  testDocument,
  openPermitShop,
}: {
  testDocument?: FishingDocument | null;
  openPermitShop?: () => void;
}) {
  const { t } = useLanguage();
  return (
    <>
      {openPermitShop && (
        <button className="primary" onClick={openPermitShop}>
          {t("copy.kj.p.nytt.fiskekort.9152e50")}
        </button>
      )}
      <DocumentsPanel kind="permit" testDocument={testDocument} />
    </>
  );
}
