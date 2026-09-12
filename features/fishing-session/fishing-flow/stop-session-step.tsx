import { FlowTitle } from "@/components/ui/flow-title";
import { formatClock, formatLongDuration } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function StopSessionStep({
  cancel,
  elapsed,
  finish,
  startTime,
  zoneName,
}: {
  cancel: () => void;
  elapsed: number;
  finish: (caught: boolean) => void;
  startTime: number | null;
  zoneName: string;
}) {
  const { language, t } = useLanguage();
  return (
    <div className="flow-content">
      <FlowTitle
        icon="clock"
        eyebrow="AVSLUTT FISKEØKT"
        title={t("copy.fikk.du.fangst.c3aa311")}
        text="Alle økter lagres, også når du ikke fikk fisk. Dette gir bedre kunnskap om fiskeinnsatsen."
      />
      <div className="stop-summary">
        <span>
          <small>{t("copy.sone.e4076c9")}</small>
          <b>{t(zoneName)}</b>
        </span>
        <span>
          <small>{t("copy.start.7196e7c")}</small>
          <b>{formatClock(startTime, language)}</b>
        </span>
        <span>
          <small>{t("copy.varighet.14840d9")}</small>
          <b>{formatLongDuration(elapsed, language)}</b>
        </span>
      </div>
      <button className="primary" onClick={() => finish(false)}>
        {t("copy.nei.registrer.nullfangst.aba2116")}
      </button>
      <button className="secondary" onClick={() => finish(true)}>
        {t("copy.ja.registrer.manglende.fangst.2f70227")}
      </button>
      <button className="text-button" onClick={cancel}>
        {t("copy.fortsett.a.fiske.38ab047")}
      </button>
    </div>
  );
}
