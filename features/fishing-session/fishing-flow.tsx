"use client";

import { useState } from "react";

import { findDemoStatus } from "@/domain/fishing-rules/find-demo-status";
import type { DemoStatus, FlowMode, SessionRecord } from "@/domain/models";
import { PositionStep } from "@/features/fishing-session/fishing-flow/steps/position-step";
import { RulesStep } from "@/features/fishing-session/fishing-flow/steps/rules-step";
import { StatusStep } from "@/features/fishing-session/fishing-flow/steps/status-step";
import { ZoneStep } from "@/features/fishing-session/fishing-flow/steps/zone-step";
import { SessionSummaryStep } from "@/features/fishing-session/fishing-flow/session-summary-step";
import { StopSessionStep } from "@/features/fishing-session/fishing-flow/stop-session-step";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";

export function FishingFlow({
  mode,
  finish,
  cancel,
  demoStatus,
  startTime,
  elapsed,
  lastSession,
  resolveBlock,
}: {
  mode: FlowMode;
  finish: (caught?: boolean, selectedZone?: number) => void;
  cancel: () => void;
  demoStatus: DemoStatus;
  startTime: number | null;
  elapsed: number;
  lastSession: SessionRecord | null;
  resolveBlock: () => void;
}) {
  const [step, setStep] = useState(1);
  const [selectedZone, setSelectedZone] = useState(3);
  const scenario = findDemoStatus(demoStatus);
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
                next={() => setStep(2)}
                resolveBlock={resolveBlock}
                scenario={scenario}
              />
            )}
            {step === 2 && <PositionStep next={() => setStep(3)} />}
            {step === 3 && (
              <ZoneStep
                demoStatus={demoStatus}
                next={() => setStep(4)}
                selectedZone={selectedZone}
                selectZone={setSelectedZone}
              />
            )}
            {step === 4 && (
              <RulesStep selectedZone={selectedZone} finish={(zone) => finish(undefined, zone)} />
            )}
          </div>
        )}

        {mode === "stop" && (
          <StopSessionStep
            cancel={cancel}
            elapsed={elapsed}
            finish={finish}
            startTime={startTime}
          />
        )}

        {mode === "summary" && lastSession && (
          <SessionSummaryStep session={lastSession} finish={() => finish()} />
        )}
      </div>
    </div>
  );
}
