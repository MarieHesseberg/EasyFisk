"use client";

import { useState } from "react";

import { fishingContentRepository } from "@/data/repositories/fishing-content";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import type { FlowMode, SessionRecord } from "@/domain/sessions/session";
import type { ZoneId } from "@/domain/zones/zone";
import { PositionStep } from "@/features/fishing-session/fishing-flow/steps/position-step";
import { RulesStep } from "@/features/fishing-session/fishing-flow/steps/rules-step";
import { StatusStep } from "@/features/fishing-session/fishing-flow/steps/status-step";
import { ZoneStep } from "@/features/fishing-session/fishing-flow/steps/zone-step";
import { SessionSummaryStep } from "@/features/fishing-session/fishing-flow/session-summary-step";
import { StopSessionStep } from "@/features/fishing-session/fishing-flow/stop-session-step";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { FishingStartQuotaStatus } from "@/domain/quotas/get-fishing-start-quota-status";

export function FishingFlow({
  mode,
  finish,
  cancel,
  demoStatus,
  scenario,
  documentReadiness,
  isStatusTestMode,
  quotaStatus,
  startTime,
  elapsed,
  lastSession,
  resolveBlock,
  openPermitShop,
  sessionZone,
}: {
  mode: FlowMode;
  finish: (caught?: boolean, selectedZone?: ZoneId) => void;
  cancel: () => void;
  demoStatus: DemoStatus;
  scenario: DemoScenario;
  documentReadiness: DocumentReadiness;
  isStatusTestMode: boolean;
  quotaStatus: FishingStartQuotaStatus;
  startTime: number | null;
  elapsed: number;
  lastSession: SessionRecord | null;
  resolveBlock: () => void;
  openPermitShop: () => void;
  sessionZone: ZoneId;
}) {
  const [step, setStep] = useState(1);
  const [selectedZone, setSelectedZone] = useState<ZoneId>(3);
  const total = mode === "start" ? 4 : 1;
  const dialogRef = useDialogAccessibility(cancel);

  return (
    <div className="flow-overlay">
      <div
        ref={dialogRef}
        className="flow-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={
          mode === "start" ? "Start fiske" : mode === "stop" ? "Avslutt økt" : "Økt fullført"
        }
        tabIndex={-1}
      >
        <div className="flow-top">
          <button onClick={cancel} aria-label="Lukk">
            ×
          </button>
          <span>
            {mode === "start" ? "START FISKE" : mode === "stop" ? "AVSLUTT ØKT" : "ØKT FULLFØRT"}
          </span>
          <em>{mode === "summary" ? "Ferdig" : `${step} av ${total}`}</em>
        </div>

        {mode === "start" && (
          <div className="flow-content">
            {step === 1 && (
              <StatusStep
                cancel={cancel}
                demoStatus={demoStatus}
                documentReadiness={documentReadiness}
                isStatusTestMode={isStatusTestMode}
                quotaStatus={quotaStatus}
                next={() => setStep(2)}
                resolveBlock={resolveBlock}
                openPermitShop={openPermitShop}
                scenario={scenario}
                selectedZone={selectedZone}
              />
            )}
            {step === 2 && <PositionStep back={() => setStep(1)} next={() => setStep(3)} />}
            {step === 3 && (
              <ZoneStep
                back={() => setStep(2)}
                demoStatus={demoStatus}
                next={() => setStep(4)}
                selectedZone={selectedZone}
                selectZone={setSelectedZone}
              />
            )}
            {step === 4 && (
              <RulesStep
                back={() => setStep(3)}
                selectedZone={selectedZone}
                finish={(zone) => finish(undefined, zone)}
              />
            )}
          </div>
        )}

        {mode === "stop" && (
          <StopSessionStep
            cancel={cancel}
            elapsed={elapsed}
            finish={finish}
            startTime={startTime}
            zoneName={fishingContentRepository.findZone(sessionZone)?.name ?? `Sone ${sessionZone}`}
          />
        )}

        {mode === "summary" && lastSession && (
          <SessionSummaryStep session={lastSession} finish={() => finish()} />
        )}
      </div>
    </div>
  );
}
