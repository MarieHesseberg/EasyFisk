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
  if (!catches.length) return null;
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
