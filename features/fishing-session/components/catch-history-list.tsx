import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/catches/catch";
import { formatClock } from "@/lib/time";
export function CatchHistoryList({
  catches,
  selectCatch,
}: {
  catches: CatchRecord[];
  selectCatch: (record: CatchRecord) => void;
}) {
  if (!catches.length) {
    return (
      <section className="catch-history-empty" aria-labelledby="catch-history-title">
        <div className="section-head">
          <h3 id="catch-history-title">Siste fangster</h3>
        </div>
        <div className="empty-list-message">
          <Icon name="fish" />
          <p>
            <b>Ingen fangster registrert</b>
            <span>Fangster du rapporterer, vises her.</span>
          </p>
        </div>
      </section>
    );
  }
  return (
    <section>
      <div className="section-head">
        <h3>Siste fangster</h3>
      </div>
      {catches
        .slice()
        .reverse()
        .map((record) => (
          <button
            className="catch-history-card"
            key={record.id}
            onClick={() => selectCatch(record)}
          >
            <span>
              <Icon name="fish" />
            </span>
            <p>
              <b>
                {record.species} · {record.result.toLowerCase()}
              </b>
              <small>
                {record.zone} · {record.length} cm · {record.weight} kg
              </small>
              <em>
                {formatClock(record.caughtAt)} ·{" "}
                {record.late ? "forsinket rapport" : "rapportert innen fristen"}
                {record.correction ? " · rettelse meldt" : ""}
              </em>
            </p>
            {record.violation ? (
              <i className="catch-violation">!</i>
            ) : (
              <Icon name="check" size={17} />
            )}
          </button>
        ))}
    </section>
  );
}
