"use client";
import { StartSessionStep } from "./fishing-flow/steps/start-session-step";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import type { DemoScenario, DemoStatus } from "@/domain/fishing-rules/rule";
import type { FlowMode, SessionRecord } from "@/domain/sessions/session";
import type { ZoneId } from "@/domain/zones/zone";
import { SessionSummaryStep } from "@/features/fishing-session/fishing-flow/session-summary-step";
import { StopSessionStep } from "@/features/fishing-session/fishing-flow/stop-session-step";
import { useDialogAccessibility } from "@/hooks/use-dialog-accessibility";
import type { DocumentReadiness } from "@/domain/documents/get-document-readiness";
import type { FishingStartQuotaStatus } from "@/domain/quotas/get-fishing-start-quota-status";
import { useLanguage } from "@/components/localization/language-provider";
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
  initialZone,
  permittedZoneIds,
  sessionSubzone,
  catchCount = 0,
}: {
  mode: FlowMode;
  finish: (caught?: boolean, selectedZone?: ZoneId, subzone?: string) => void;
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
  initialZone: ZoneId;
  permittedZoneIds: readonly ZoneId[];
  sessionSubzone?: string;
  catchCount?: number;
}) {
  const { t } = useLanguage();
  const dialogRef = useDialogAccessibility(cancel);
  return (
    <div className="flow-overlay">
      <div
        ref={dialogRef}
        className="flow-sheet"
        role="dialog"
        aria-modal="false"
        aria-label={t(
          mode === "start" ? "Start fiske" : mode === "stop" ? "Avslutt økt" : "Økt fullført",
        )}
        tabIndex={-1}
      >
        <div className="flow-top">
          <button onClick={cancel} aria-label={t("copy.lukk.1949e04")}>
            ×
          </button>
          <span>
            {t(mode === "start" ? "START FISKE" : mode === "stop" ? "AVSLUTT ØKT" : "ØKT FULLFØRT")}
          </span>
          {mode === "summary" && <em>{t("copy.ferdig.1f6ddf8")}</em>}
        </div>

        {mode === "start" && (
          <div className="flow-content start-session-content">
            <StartSessionStep
              initialZone={initialZone}
              permittedZoneIds={permittedZoneIds}
              demoStatus={demoStatus}
              scenario={scenario}
              documentReadiness={documentReadiness}
              isStatusTestMode={isStatusTestMode}
              quotaStatus={quotaStatus}
              resolveBlock={resolveBlock}
              openPermitShop={openPermitShop}
              finish={(zone, subzone) => finish(undefined, zone, subzone)}
            />
          </div>
        )}

        {mode === "stop" && (
          <StopSessionStep
            cancel={cancel}
            elapsed={elapsed}
            finish={finish}
            startTime={startTime}
            catchCount={catchCount}
            zoneName={[
              fishingContentRepository.findZone(sessionZone)?.name ?? `Sone ${sessionZone}`,
              sessionSubzone,
            ]
              .filter(Boolean)
              .join(" · ")}
          />
        )}

        {mode === "summary" && lastSession && (
          <SessionSummaryStep session={lastSession} finish={() => finish()} />
        )}
      </div>
    </div>
  );
}
