import { FlowTitle } from "@/components/ui/flow-title";
import type { SessionRecord } from "@/domain/sessions/session";
import { formatClock, formatLongDuration } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function SessionSummaryStep({
  finish,
  session,
}: {
  finish: () => void;
  session: SessionRecord;
}) {
  const { language, t } = useLanguage();
  return (
    <div className="flow-content">
      <FlowTitle
        icon="check"
        eyebrow="ØKTEN ER LAGRET"
        title={t("copy.takk.for.rapporteringen.c880a91")}
        text="Fiskeaktiviteten er lagret og lagt til i økthistorikken."
      />
      <div className="final-summary">
        <div>
          <small>{t("copy.sone.e4076c9")}</small>
          <b>{t(session.zone)}</b>
        </div>
        <div>
          <small>{t("copy.tidspunkt.00d279e")}</small>
          <b>
            {formatClock(session.start, language)}–{formatClock(session.end, language)}
          </b>
        </div>
        <div>
          <small>{t("copy.varighet.14840d9")}</small>
          <b>{formatLongDuration(session.duration, language)}</b>
        </div>
        <div>
          <small>{t("copy.fangst.31f8f71")}</small>
          <b>{t(session.result)}</b>
        </div>
        <div>
          <small>{t("copy.rapportstatus.f529088")}</small>
          <b className="status-positive">{t("copy.fullf.rt.og.registrert.26e53d3")}</b>
        </div>
      </div>
      <button className="primary" onClick={finish}>
        {t("copy.tilbake.til.oversikten.4c16332")}
      </button>
    </div>
  );
}
