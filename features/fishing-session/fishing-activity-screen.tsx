"use client";

import { useState } from "react";

import { ScreenHeader } from "@/components/ui/screen-header";
import { Icon } from "@/components/ui/icon";
import { appContentRepository } from "@/data/repositories/app-content";
import type { CatchRecord } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import { CatchReportDetail } from "@/features/catch-report/catch-report-detail";
import { CatchReportModal } from "@/features/catch-report/catch-report-modal";
import { ActiveSessionCard } from "@/features/fishing-session/components/active-session-card";
import { CatchHistoryList } from "@/features/fishing-session/components/catch-history-list";
import { SessionHistoryList } from "@/features/fishing-session/components/session-history-list";
import { PastSessionForm } from "@/features/history/past-session-form";

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
  lastSession,
  elapsed,
  startTime,
  embedded = false,
}: {
  active: boolean;
  onStart: () => void;
  onStop: () => void;
  onAddPast: (record: SessionRecord, catchRecords?: CatchRecord[]) => void;
  onCatch: (record: CatchRecord) => void;
  onCatchFlowComplete: () => void;
  finishAfterCatch: boolean;
  catches: CatchRecord[];
  activeZone: string;
  requestedCatchTime: number;
  onCorrectCatch: (id: string, note: string) => void;
  onShowRules: () => void;
  elapsed: number;
  startTime: number | null;
  lastSession: SessionRecord | null;
  embedded?: boolean;
}) {
  const { activityHistory } = appContentRepository.getContent();
  const [showCatchReport, setShowCatchReport] = useState(false);
  const [showPastSession, setShowPastSession] = useState(false);
  const [selectedCatch, setSelectedCatch] = useState<CatchRecord | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  return (
    <div className={embedded ? "activity-embedded" : "screen"}>
      {!embedded && <ScreenHeader title="Min aktivitet" />}
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
          <h2>Ingen aktiv fiskeøkt</h2>
          <p>Start registrerer fisketid og sone. Ved stopp bekrefter du fangst eller nullfangst.</p>
          <button className="primary" onClick={onStart}>
            Kontroller status og start
          </button>
        </section>
      )}

      <button className="past-session-button" onClick={() => setShowPastSession(true)}>
        <Icon name="clock" />
        <span>
          <b>Registrer tidligere fisketur</b>
          <small>For turer og fangster du glemte å registrere</small>
        </span>
        <Icon name="chevron" size={18} />
      </button>

      <CatchHistoryList catches={catches} selectCatch={setSelectedCatch} />
      <SessionHistoryList
        entries={activityHistory}
        lastSession={lastSession}
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
