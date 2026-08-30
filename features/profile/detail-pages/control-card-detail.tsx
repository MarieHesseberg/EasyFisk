"use client";

import { useState } from "react";
import { DocumentsPanel } from "@/features/documents/documents-panel";
import { documentTitles, type DocumentKind } from "@/domain/documents/fishing-document";

export function ControlCardDetail() {
  const [kind, setKind] = useState<DocumentKind>("permit");
  return (
    <div>
      <p>
        Din lokale dokumentmappe. Appen utsteder ikke kontrollbevis. Ta med originalene og vis
        dokumentasjonen fra utsteder ved kontroll.
      </p>
      <div className="choice">
        {(["permit", "disinfection", "fee"] as const).map((value) => (
          <button
            key={value}
            aria-pressed={value === kind}
            className={value === kind ? "selected" : ""}
            onClick={() => setKind(value)}
          >
            {documentTitles[value]}
          </button>
        ))}
      </div>
      <DocumentsPanel key={kind} kind={kind} />
    </div>
  );
}
