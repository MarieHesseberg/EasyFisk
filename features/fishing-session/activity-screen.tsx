"use client";

import { useState } from "react";

import { Header } from "@/components/ui/header";
import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import { CatchReportDetail } from "@/features/catch-report/catch-report-detail";
import { CatchReportModal } from "@/features/catch-report/catch-report-modal";
import { PastSessionForm } from "@/features/history/past-session-form";
import { History } from "@/features/statistics/history-card";
import { formatClock, formatDuration, formatLongDuration } from "@/lib/time";

export function Activity({
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
  const [showCatchReport, setShowCatchReport] = useState(false);
  const [showPastSession, setShowPastSession] = useState(false);
  const [selectedCatch, setSelectedCatch] = useState<CatchRecord | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  return (
    <div className={embedded ? "activity-embedded" : "screen"}>
      {!embedded && <Header title="Min aktivitet" />}
      {active ? (
        <section className="active-session">
          <span className="pulse" />
          <small>AKTIV FISKEØKT</small>
          <h2>{activeZone}</h2>
          <div className="big-time">{formatDuration(elapsed)}</div>
          <p>Startet i dag kl. {formatClock(startTime)} · GPS-sone bekreftet</p>
          <div className="session-actions">
            <button onClick={() => setShowCatchReport(true)}>
              <Icon name="fish" />
              Registrer fangst
            </button>
            <button onClick={onShowRules}>
              <Icon name="map" />
              Sone og regler
            </button>
          </div>
          <button className="outline-danger" onClick={onStop}>
            Stopp · bekreft fangst eller nullfangst
          </button>
        </section>
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

      {catches.length > 0 && (
        <section>
          <div className="section-head">
            <h3>Siste fangster</h3>
          </div>
          {catches
            .slice()
            .reverse()
            .map((item) => (
              <button
                className="catch-history-card"
                key={item.id}
                onClick={() => setSelectedCatch(item)}
              >
                <span>
                  <Icon name="fish" />
                </span>
                <p>
                  <b>
                    {item.species} · {item.result.toLowerCase()}
                  </b>
                  <small>
                    {item.zone} · {item.length} cm · {item.weight} kg
                  </small>
                  <em>
                    {formatClock(item.caughtAt)} ·{" "}
                    {item.late ? "forsinket rapport" : "rapportert innen fristen"}
                    {item.correction ? " · rettelse meldt" : ""}
                  </em>
                </p>
                {item.violation ? (
                  <i className="catch-violation">!</i>
                ) : (
                  <Icon name="check" size={17} />
                )}
              </button>
            ))}
        </section>
      )}

      <section>
        <div className="section-head">
          <h3>Siste fiskeøkter</h3>
          <button onClick={() => setShowAllHistory((current) => !current)}>
            {showAllHistory ? "Vis færre" : "Se alle"}
          </button>
        </div>
        {lastSession && (
          <History
            day={String(new Date(lastSession.end).getDate()).padStart(2, "0")}
            title={lastSession.zone}
            time={`${formatClock(lastSession.start)}–${formatClock(lastSession.end)} · ${formatLongDuration(lastSession.duration)}`}
            result={lastSession.result}
          />
        )}
        <History
          day="16"
          title="Sone 2 · Fuskeland B"
          time="18:10–21:42 · 3 t 32 min"
          result="1 laks · gjenutsatt"
        />
        {showAllHistory && (
          <>
            <History
              day="08"
              title="Sone 1 · Mandal–Krossen"
              time="19:20–20:55 · 1 t 35 min"
              result="1 sjøørret · gjenutsatt"
            />
            <History
              day="03"
              title="Sone 4 · Laudal–Kavfossen"
              time="06:40–09:05 · 2 t 25 min"
              result="Nullfangst rapportert"
            />
          </>
        )}
        <History
          day="12"
          title="Sone 3 · Øyslebø–Laudal"
          time="07:15–10:03 · 2 t 48 min"
          result="Nullfangst rapportert"
        />
      </section>

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
