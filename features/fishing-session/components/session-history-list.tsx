import type { HistoryEntry } from "@/data/contracts/app-content-repository";
import type { SessionRecord } from "@/domain/sessions/session";
import { FishingHistoryCard } from "@/features/statistics/fishing-history-card";
import { formatClock, formatLongDuration } from "@/lib/time";
export function SessionHistoryList({
  entries,
  lastSession,
  showAll,
  toggleAll,
}: {
  entries: readonly HistoryEntry[];
  lastSession: SessionRecord | null;
  showAll: boolean;
  toggleAll: () => void;
}) {
  return (
    <section>
      <div className="section-head">
        <h3>Siste fiskeøkter</h3>
        <button onClick={toggleAll}>{showAll ? "Vis færre" : "Se alle"}</button>
      </div>
      {lastSession && (
        <FishingHistoryCard
          day={String(new Date(lastSession.end).getDate()).padStart(2, "0")}
          title={lastSession.zone}
          time={`${formatClock(lastSession.start)}–${formatClock(lastSession.end)} · ${formatLongDuration(lastSession.duration)}`}
          result={lastSession.result}
        />
      )}
      {entries.map((entry, index) =>
        showAll || index === 0 || index === entries.length - 1 ? (
          <FishingHistoryCard key={`${entry.day}-${entry.title}`} {...entry} />
        ) : null,
      )}
    </section>
  );
}
