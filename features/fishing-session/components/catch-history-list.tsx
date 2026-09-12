import { Icon } from "@/components/ui/icon";
import type { CatchRecord } from "@/domain/catches/catch";
import { formatClock } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function CatchHistoryList({
  catches,
  selectCatch,
}: {
  catches: CatchRecord[];
  selectCatch: (record: CatchRecord) => void;
}) {
  const { t } = useLanguage();
  if (!catches.length) {
    return (
      <section className="catch-history-empty" aria-labelledby="catch-history-title">
        <div className="section-head">
          <h3 id="catch-history-title">{t("copy.siste.fangster.cda78f3")}</h3>
        </div>
        <div className="empty-list-message">
          <Icon name="fish" />
          <p>
            <b>{t("copy.ingen.fangster.registrert.3874954")}</b>
            <span>{t("copy.fangster.du.rapporterer.vises.her.fdb15db")}</span>
          </p>
        </div>
      </section>
    );
  }
  return (
    <section>
      <div className="section-head">
        <h3>{t("copy.siste.fangster.cda78f3")}</h3>
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
                {t(record.species)} · {t(record.result).toLowerCase()}
              </b>
              <small>
                {t(record.zone)} · {record.length} cm · {record.weight} kg
              </small>
              <em>
                {formatClock(record.caughtAt)} ·{" "}
                {t(record.late ? "forsinket rapport" : "rapportert innen fristen")}
                {record.correction ? ` · ${t("copy.rettelse.meldt.60dd0a8")}` : ""}
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
