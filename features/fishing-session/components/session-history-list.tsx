"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import { SessionHistoryDetail } from "@/features/fishing-session/components/session-history-detail";
import { FishingHistoryCard } from "@/features/statistics/fishing-history-card";
import { formatClock, formatLongDuration } from "@/lib/time";

const norwegianMonth = new Intl.DateTimeFormat("nb-NO", { month: "short" });

export function SessionHistoryList({
  catches,
  sessions,
  showAll,
  toggleAll,
}: {
  catches: CatchRecord[];
  sessions: SessionRecord[];
  showAll: boolean;
  toggleAll: () => void;
}) {
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const visibleSessions = showAll ? sessions : sessions.slice(0, 3);

  return (
    <section>
      <div className="section-head">
        <h3>Siste fiskeøkter</h3>
        {sessions.length > 3 && (
          <button onClick={toggleAll}>{showAll ? "Vis færre" : "Se alle"}</button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="empty-list-message">
          <Icon name="clock" size={24} />
          <p>
            <b>Ingen tidligere fiskeøkter</b>
            <span>Avslutt en fiskeøkt eller etterregistrer en tur for å bygge historikken.</span>
          </p>
        </div>
      ) : (
        visibleSessions.map((session) => {
          const date = new Date(session.end);
          return (
            <FishingHistoryCard
              key={session.id}
              day={String(date.getDate()).padStart(2, "0")}
              month={norwegianMonth.format(date).replace(".", "").toUpperCase()}
              title={session.zone}
              time={`${formatClock(session.start)}–${formatClock(session.end)} · ${formatLongDuration(session.duration)}`}
              result={session.result}
              onClick={() => setSelectedSession(session)}
            />
          );
        })
      )}

      {selectedSession && (
        <SessionHistoryDetail
          session={selectedSession}
          catches={catches.filter((record) => record.sessionStart === selectedSession.start)}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </section>
  );
}
