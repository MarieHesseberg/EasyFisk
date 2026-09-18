"use client";
import { DraftScope, DraftControls, useDraftState } from "@/hooks/use-draft";
import { CatchEntryForm } from "./catch-entry-form";
import { getAppNow } from "@/domain/shared/app-clock";

import { createPortal } from "react-dom";

import type { CatchRecord } from "@/domain/catches/catch";
import type { AsyncOperationResult } from "@/domain/shared/operation-result";
import { useCatchReportController } from "@/features/catch-report/hooks/use-catch-report-controller";
import { CatchConfirmationStep } from "@/features/catch-report/steps/catch-confirmation-step";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";
import { useLanguage } from "@/components/localization/language-provider";

function CatchReportModalContent({
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
  onCatch: (record: CatchRecord) => AsyncOperationResult<unknown>;
  onCatchFlowComplete: () => void;
  onClose: () => void;
  requestedCatchTime: number;
  startTime: number | null;
}) {
  const { t } = useLanguage();
  const [caughtAt] = useDraftState("caughtAt", () => requestedCatchTime || getAppNow());
  const portalTarget = document.querySelector<HTMLElement>(".phone-app") ?? document.body;
  const controller = useCatchReportController({
    activeZone,
    catches,
    caughtAt,
    onCatch,
    sessionStart: startTime || caughtAt,
  });
  const { step } = controller.state;
  const dialogRef = useDialogAccessibility(onClose);

  function finish() {
    onClose();
    if (finishAfterCatch) onCatchFlowComplete();
  }

  return createPortal(
    <div className="modal-bg" onClick={finishAfterCatch ? undefined : onClose}>
      <div
        ref={dialogRef}
        className={`catch-modal catch-modal-step-${step}`}
        role="dialog"
        aria-modal="false"
        aria-label={t("copy.registrer.fangst.7ecfe4d")}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="modal-close"
          aria-label={t("copy.lukk.fangstrapport.ad00025")}
          onClick={onClose}
        >
          ×
        </button>
        <div className="sheet-handle" />
        {step < 4 && <DraftControls disabled={controller.state.isSubmitting} />}
        {step < 4 && <CatchEntryForm controller={controller} />}
        {step === 4 && (
          <CatchConfirmationStep
            catches={catches}
            controller={controller}
            finishAfterCatch={finishAfterCatch}
            onDone={finish}
          />
        )}
      </div>
    </div>,
    portalTarget,
  );
}

export function CatchReportModal(props: Parameters<typeof CatchReportModalContent>[0]) {
  const id = `catch:${props.startTime ?? "past"}:${props.activeZone}`;
  return (
    <DraftScope key={id} id={id}>
      <CatchReportModalContent {...props} />
    </DraftScope>
  );
}
