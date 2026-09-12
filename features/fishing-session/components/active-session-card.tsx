import { selectLocalized } from "@/locales";
import { Icon } from "@/components/ui/icon";
import { formatClock, formatDuration } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
export function ActiveSessionCard({
  activeZone,
  elapsed,
  startTime,
  registerCatch,
  showRules,
  stop,
}: {
  activeZone: string;
  elapsed: number;
  startTime: number | null;
  registerCatch: () => void;
  showRules: () => void;
  stop: () => void;
}) {
  const { language, t } = useLanguage();
  return (
    <section className="active-session">
      <span className="pulse" />
      <small>{t("copy.aktiv.fiske.kt.316984d")}</small>
      <h2>{t(activeZone)}</h2>
      <div className="big-time">{formatDuration(elapsed)}</div>
      <p>
        {selectLocalized(
          language,
          `Startet i dag kl. ${formatClock(startTime, language)} · GPS-sone bekreftet`,
          `Started today at ${formatClock(startTime, language)} · GPS zone confirmed`,
        )}
      </p>
      <div className="session-actions">
        <button onClick={registerCatch}>
          <Icon name="fish" />
          {t("copy.registrer.fangst.7ecfe4d")}
        </button>
        <button onClick={showRules}>
          <Icon name="map" />
          {t("copy.sone.og.regler.44d7d17")}
        </button>
      </div>
      <button className="outline-danger" onClick={stop}>
        {t("copy.stopp.bekreft.fangst.eller.nullfangst.daab96b")}
      </button>
    </section>
  );
}
