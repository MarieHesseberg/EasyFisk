"use client";
import { useRef, useState } from "react";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import type { AsyncOperationResult } from "@/domain/shared/operation-result";
import { CatchReportDetail } from "@/features/catch-report/catch-report-detail";
import { CatchReportModal } from "@/features/catch-report/catch-report-modal";
import { ActiveSessionCard } from "@/features/fishing-session/components/active-session-card";
import { CatchHistoryList } from "@/features/fishing-session/components/catch-history-list";
import { SessionHistoryList } from "@/features/fishing-session/components/session-history-list";
import { PastSessionForm } from "@/features/history/past-session-form";
import { useLanguage } from "@/components/localization/language-provider";
export function FishingActivityScreen({
  active,
  onStart,
  onStop,
  onAddPast,
  onCatch,
  onCatchFlowComplete,
  finishAfterCatch,
  catches,
  activeZone,
  requestedCatchTime,
  onCorrectCatch,
  onShowRules,
  sessions,
  elapsed,
  startTime,
  embedded = false,
  openPastSession = false,
}: {
  active: boolean;
  onStart: () => void;
  onStop: () => void;
  onAddPast: (record: SessionRecord, catchRecords?: CatchRecord[]) => AsyncOperationResult<unknown>;
  onCatch: (record: CatchRecord) => AsyncOperationResult<unknown>;
  onCatchFlowComplete: () => void;
  finishAfterCatch: boolean;
  catches: CatchRecord[];
  activeZone: string;
  requestedCatchTime: number;
  onCorrectCatch: (id: string, note: string) => void;
  onShowRules: () => void;
  elapsed: number;
  startTime: number | null;
  sessions: SessionRecord[];
  embedded?: boolean;
  openPastSession?: boolean;
}) {
  const { t } = useLanguage();
  const [showCatchReport, setShowCatchReport] = useState(false);
  const [showPastSession, setShowPastSession] = useState(openPastSession);
  const [selectedCatch, setSelectedCatch] = useState<CatchRecord | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const pastSessionButtonRef = useRef<HTMLButtonElement>(null);
  return (
    <div className={embedded ? "activity-embedded" : "screen"}>
      {!embedded && <ScreenHeader title={t("copy.min.aktivitet.6c12773")} />}
      {active ? (
        <ActiveSessionCard
          activeZone={activeZone}
          elapsed={elapsed}
          startTime={startTime}
          registerCatch={() => setShowCatchReport(true)}
          showRules={onShowRules}
          stop={onStop}
        />
      ) : (
        <section className="empty">
          <span>
            <Icon name="clock" size={35} />
          </span>
          <h2>{t("copy.ingen.aktiv.fiske.kt.c93e571")}</h2>
          <p>{t("copy.start.registrerer.fisketid.og.sone.ved.stopp.bek.32fa5b7")}</p>
          <button className="primary" onClick={onStart}>
            {t("copy.kontroller.status.og.start.f46c2da")}
          </button>
        </section>
      )}

      <button
        ref={pastSessionButtonRef}
        className="past-session-button"
        onClick={() => setShowPastSession(true)}
      >
        <Icon name="clock" />
        <span>
          <b>{t("copy.registrer.tidligere.fisketur.4812b12")}</b>
          <small>{t("copy.for.turer.og.fangster.du.glemte.a.registrere.7de9ead")}</small>
        </span>
        <Icon name="chevron" size={18} />
      </button>

      <CatchHistoryList catches={catches} selectCatch={setSelectedCatch} />
      <SessionHistoryList
        catches={catches}
        sessions={sessions}
        showAll={showAllHistory}
        toggleAll={() => setShowAllHistory((current) => !current)}
      />

      {(showCatchReport || finishAfterCatch) && (
        <CatchReportModal
          activeZone={activeZone}
          catches={catches}
          finishAfterCatch={finishAfterCatch}
          onCatch={onCatch}
          onCatchFlowComplete={onCatchFlowComplete}
          onClose={() => setShowCatchReport(false)}
          requestedCatchTime={requestedCatchTime}
          startTime={startTime}
        />
      )}

      {showPastSession && (
        <PastSessionForm
          onClose={() => setShowPastSession(false)}
          existingCatches={catches}
          onSave={onAddPast}
          returnFocusRef={pastSessionButtonRef}
        />
      )}

      {selectedCatch && (
        <CatchReportDetail
          report={selectedCatch}
          onClose={() => setSelectedCatch(null)}
          onCorrect={(note) => {
            onCorrectCatch(selectedCatch.id, note);
            setSelectedCatch({ ...selectedCatch, correction: note });
          }}
        />
      )}
    </div>
  );
}
