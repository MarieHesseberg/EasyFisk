"use client";

import { useState } from "react";
import { DocumentsPanel } from "@/features/documents/documents-panel";
import { documentTitles, type DocumentKind } from "@/domain/documents/fishing-document";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { useLanguage } from "@/components/localization/language-provider";

export function ControlCardDetail({ testReadiness }: { testReadiness?: DocumentReadiness }) {
  const { t } = useLanguage();
  const [kind, setKind] = useState<DocumentKind>("permit");
  const testDocuments = fishingContentRepository.getDemoDocuments();
  return (
    <div>
      <p>{t("documents.controlFolderNote")}</p>
      <div className="choice">
        {(["permit", "disinfection", "fee"] as const).map((value) => (
          <button
            key={value}
            aria-pressed={value === kind}
            className={value === kind ? "selected" : ""}
            onClick={() => setKind(value)}
          >
            {t(documentTitles[value])}
          </button>
        ))}
      </div>
      <DocumentsPanel
        key={kind}
        kind={kind}
        testDocument={
          testReadiness === undefined
            ? undefined
            : testReadiness.valid[kind]
              ? testDocuments[kind]
              : null
        }
      />
    </div>
  );
}
