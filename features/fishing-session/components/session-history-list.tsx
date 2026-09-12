"use client";
import { localizeSessionResult } from "@/lib/localize-session-result";

import { selectLocalized } from "@/locales";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/catches/catch";
import type { SessionRecord } from "@/domain/sessions/session";
import { SessionHistoryDetail } from "@/features/fishing-session/components/session-history-detail";
import { FishingHistoryCard } from "@/features/statistics/fishing-history-card";
import { formatClock, formatLongDuration } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
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
  const { language, t } = useLanguage();
  const monthFormatter = new Intl.DateTimeFormat(selectLocalized(language, "nb-NO", "en-GB"), {
    month: "short",
  });
  const [selectedSession, setSelectedSession] = useState<SessionRecord | null>(null);
  const visibleSessions = showAll ? sessions : sessions.slice(0, 3);
  return (
    <section>
      <div className="section-head">
        <h3>{t("copy.siste.fiske.kter.7ecd617")}</h3>
        {sessions.length > 3 && (
          <button onClick={toggleAll}>{t(showAll ? "Vis færre" : "Se alle")}</button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="empty-list-message">
          <Icon name="clock" size={24} />
          <p>
            <b>{t("copy.ingen.tidligere.fiske.kter.c735256")}</b>
            <span>{t("copy.avslutt.en.fiske.kt.eller.etterregistrer.en.tur..08f0f9f")}</span>
          </p>
        </div>
      ) : (
        visibleSessions.map((session) => {
          const date = new Date(session.end);
          return (
            <FishingHistoryCard
              key={session.id}
              day={String(date.getDate()).padStart(2, "0")}
              month={monthFormatter.format(date).replace(".", "").toUpperCase()}
              title={t(session.zone)}
              time={`${formatClock(session.start, language)}–${formatClock(session.end, language)} · ${formatLongDuration(session.duration, language)}`}
              result={localizeSessionResult(session.result, language)}
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
