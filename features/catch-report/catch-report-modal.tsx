"use client";

import { useState } from "react";

import type { CatchRecord } from "@/domain/catches/catch";
import { useCatchReportController } from "@/features/catch-report/hooks/use-catch-report-controller";
import { CatchConfirmationStep } from "@/features/catch-report/steps/catch-confirmation-step";
import { CatchDetailsStep } from "@/features/catch-report/steps/catch-details-step";
import { CatchReviewStep } from "@/features/catch-report/steps/catch-review-step";
import { CatchSelectionStep } from "@/features/catch-report/steps/catch-selection-step";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";

export function CatchReportModal({
  activeZone,
  catches,
  finishAfterCatch,
  onCatch,
  onCatchFlowComplete,
  onClose,
  requestedCatchTime,
  startTime,
}: {
  activeZone: string;
  catches: CatchRecord[];
  finishAfterCatch: boolean;
  onCatch: (record: CatchRecord) => void;
  onCatchFlowComplete: () => void;
  onClose: () => void;
  requestedCatchTime: number;
  startTime: number | null;
}) {
  const [caughtAt] = useState(() => requestedCatchTime || Date.now());
  const controller = useCatchReportController({
    activeZone,
    catches,
    caughtAt,
    onCatch,
    sessionStart: startTime || caughtAt,
  });
  const { step } = controller.state;
  const dialogRef = useDialogAccessibility(finishAfterCatch ? undefined : onClose);

  function finish() {
    onClose();
    if (finishAfterCatch) onCatchFlowComplete();
  }

  return (
    <div className="modal-bg" onClick={finishAfterCatch ? undefined : onClose}>
      <div
        ref={dialogRef}
        className="catch-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Registrer fangst"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="modal-close" aria-label="Lukk fangstrapport" onClick={onClose}>
          ×
        </button>
        <div className="sheet-handle" />
        <div className="steps four">
          <span className={step >= 1 ? "on" : ""}>1</span>
          <i />
          <span className={step >= 2 ? "on" : ""}>2</span>
          <i />
          <span className={step >= 3 ? "on" : ""}>3</span>
          <i />
          <span className={step >= 4 ? "on" : ""}>4</span>
        </div>

        {step === 1 && <CatchSelectionStep controller={controller} />}
        {step === 2 && <CatchDetailsStep controller={controller} />}
        {step === 3 && (
          <CatchReviewStep activeZone={activeZone} caughtAt={caughtAt} controller={controller} />
        )}
        {step === 4 && (
          <CatchConfirmationStep
            catches={catches}
            controller={controller}
            finishAfterCatch={finishAfterCatch}
            onDone={finish}
          />
        )}
      </div>
    </div>
  );
}
