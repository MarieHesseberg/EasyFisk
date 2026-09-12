import { DocumentsPanel } from "@/features/documents/documents-panel";
import type { FishingDocument } from "@/domain/documents/fishing-document";
import { useLanguage } from "@/components/localization/language-provider";

export function DisinfectionDetail({ testDocument }: { testDocument?: FishingDocument | null }) {
  const { t } = useLanguage();
  return (
    <>
      <section className="document-verifier-card" aria-labelledby="disinfection-approval-title">
        <small>{t("documents.howApprovalWorksEyebrow")}</small>
        <h3 id="disinfection-approval-title">{t("documents.howApprovalWorks")}</h3>
        <ol>
          <li>{t("documents.approvalStepOne")}</li>
          <li>{t("documents.approvalStepTwo")}</li>
          <li>{t("documents.approvalStepThree")}</li>
        </ol>
        <p>{t("documents.approvalPrototypeNote")}</p>
      </section>
      <DocumentsPanel kind="disinfection" testDocument={testDocument} />
    </>
  );
}
