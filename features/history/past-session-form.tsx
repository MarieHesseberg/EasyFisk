"use client";

import type { CatchRecord } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import type { OperationResult } from "@/domain/shared/operation-result";
import { AppDialogPortal } from "@/components/ui/app-dialog-portal";
import { usePastSessionController } from "@/features/history/hooks/use-past-session-controller";
import { CatchDetailsStep } from "@/features/history/past-session/catch-details-step";
import { ConfirmationStep } from "@/features/history/past-session/confirmation-step";
import { ReviewStep } from "@/features/history/past-session/review-step";
import { SessionDetailsStep } from "@/features/history/past-session/session-details-step";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";

export function PastSessionForm({
  onClose,
  onSave,
  existingCatches,
}: {
  onClose: () => void;
  onSave: (record: SessionRecord, catches?: CatchRecord[]) => OperationResult<unknown>;
  existingCatches: CatchRecord[];
}) {
  const controller = usePastSessionController({ existingCatches, onSave });
  const { step } = controller.state;
  const dialogRef = useDialogAccessibility(onClose);
  return (
    <AppDialogPortal>
      <div className="modal-bg" onClick={step === 4 ? onClose : undefined}>
        <div
          ref={dialogRef}
          className="catch-modal past-session-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Registrer tidligere fisketur"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="modal-close" aria-label="Lukk registrering" onClick={onClose}>
            ×
          </button>
          <div className="steps four">
            <span className={step >= 1 ? "on" : ""}>1</span>
            <i />
            <span className={step >= 2 ? "on" : ""}>2</span>
            <i />
            <span className={step >= 3 ? "on" : ""}>3</span>
            <i />
            <span className={step >= 4 ? "on" : ""}>4</span>
          </div>
          {step === 1 && <SessionDetailsStep controller={controller} />}
          {step === 2 && <CatchDetailsStep controller={controller} />}
          {step === 3 && <ReviewStep controller={controller} />}
          {step === 4 && <ConfirmationStep controller={controller} onClose={onClose} />}
        </div>
      </div>
    </AppDialogPortal>
  );
}
