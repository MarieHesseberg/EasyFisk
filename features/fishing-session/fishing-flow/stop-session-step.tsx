import { localizeZoneName } from "@/lib/localize-zone-name";
import { selectLocalized } from "@/locales";
import { FlowTitle } from "@/components/ui/flow-title";
import { formatClock, formatLongDuration } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function StopSessionStep({
  cancel,
  elapsed,
  finish,
  startTime,
  zoneName,
  catchCount = 0,
}: {
  cancel: () => void;
  elapsed: number;
  finish: (caught: boolean) => void;
  startTime: number | null;
  zoneName: string;
  catchCount?: number;
}) {
  const { language, t } = useLanguage();
  return (
    <div className="flow-content">
      <FlowTitle
        icon="clock"
        eyebrow="AVSLUTT FISKEØKT"
        title={
          catchCount
            ? selectLocalized(
                language,
                `${catchCount} fangst${catchCount === 1 ? "" : "er"} registrert`,
                `${catchCount} ${catchCount === 1 ? "catch" : "catches"} recorded`,
              )
            : selectLocalized(language, "Avslutte uten fangst?", "Finish without a catch?")
        }
        text={selectLocalized(
          language,
          "Sjekk at alle fangstene er registrert før du avslutter.",
          "Check that all catches are recorded before finishing.",
        )}
      />
      <div className="stop-summary">
        <span>
          <small>{t("copy.sone.e4076c9")}</small>
          <b>{localizeZoneName(zoneName, language)}</b>
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
        {catchCount
          ? selectLocalized(
              language,
              "Avslutt tur med registrerte fangster",
              "Finish trip with recorded catches",
            )
          : selectLocalized(language, "Avslutt uten fangst", "Finish without a catch")}
      </button>
      <button className="secondary" onClick={() => finish(true)}>
        {selectLocalized(language, "Registrer manglende fangst", "Record a missing catch")}
      </button>
      <button className="text-button" onClick={cancel}>
        {t("copy.fortsett.a.fiske.38ab047")}
      </button>
    </div>
  );
}
