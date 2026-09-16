import { localizeZoneName } from "@/lib/localize-zone-name";
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
  compact = false,
}: {
  activeZone: string;
  elapsed: number;
  startTime: number | null;
  registerCatch: () => void;
  showRules: () => void;
  stop: () => void;
  compact?: boolean;
}) {
  const { language, t } = useLanguage();
  return (
    <section className={`active-session${compact ? " active-session-compact" : ""}`}>
      <span className="pulse" />
      <small>{t("copy.aktiv.fiske.kt.316984d")}</small>
      <h2>{localizeZoneName(activeZone, language)}</h2>
      <div className="big-time">{formatDuration(elapsed)}</div>
      <p>
        {selectLocalized(
          language,
          `Startet kl. ${formatClock(startTime, language)} · valgt sone`,
          `Started at ${formatClock(startTime, language)} · selected zone`,
        )}
      </p>
      <div className="session-actions">
        <button onClick={registerCatch}>
          <Icon name="fish" />
          {t("copy.registrer.fangst.7ecfe4d")}
        </button>
        {!compact && (
          <button onClick={showRules}>
            <Icon name="map" />
            {t("copy.sone.og.regler.44d7d17")}
          </button>
        )}
      </div>
      <button className="outline-danger" onClick={stop}>
        {selectLocalized(language, "Avslutt tur", "Finish trip")}
      </button>
    </section>
  );
}
