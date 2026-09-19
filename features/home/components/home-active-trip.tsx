import { Icon } from "@/components/ui/icon";
import { useLanguage } from "@/components/localization/language-provider";
import { selectLocalized } from "@/locales";
import { localizeZoneName } from "@/lib/localize-zone-name";
import { formatClock, formatDuration } from "@/lib/time";

export function HomeActiveTrip({
  zoneName,
  elapsed,
  startTime,
  onRegisterCatch,
  onStop,
}: {
  zoneName: string;
  elapsed: number;
  startTime: number | null;
  onRegisterCatch: () => void;
  onStop: () => void;
}) {
  const { language } = useLanguage();
  return (
    <section className="home-active-trip">
      <span className="home-fishing-badge">
        <Icon name="clock" size={15} />
        {selectLocalized(language, "Fiske pågår", "Fishing in progress")}
      </span>
      <h2>{selectLocalized(language, "God tur ved elva", "Enjoy your time by the river")}</h2>
      <p className="home-active-zone">{localizeZoneName(zoneName, language)}</p>
      <div className="home-time-card">
        <p>{selectLocalized(language, "Tid på tur", "Time fishing")}</p>
        <div className="home-trip-timer">{formatDuration(elapsed)}</div>
        <small>
          {selectLocalized(language, "Startet kl.", "Started at")}{" "}
          {formatClock(startTime, language)}
        </small>
      </div>
      <button className="primary" onClick={onRegisterCatch}>
        {selectLocalized(language, "Registrer fangst", "Register catch")}
      </button>
      <button className="secondary" onClick={onStop}>
        {selectLocalized(language, "Avslutt fisketuren", "Finish trip")}
      </button>
    </section>
  );
}
