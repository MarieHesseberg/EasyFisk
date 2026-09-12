import { selectLocalized } from "@/locales";
import { Icon } from "@/components/ui/icon";
import type { DemoScenario } from "@/domain/fishing-rules/rule";
import { formatClock, formatDuration } from "@/lib/time";
import { useLanguage } from "@/components/localization/language-provider";
import { localizeText } from "@/domain/localization/localized-text";
export function HomeSessionCard({
  active,
  elapsed,
  startTime,
  scenario,
  isTestMode,
  zone,
  openFlow,
}: {
  active: boolean;
  elapsed: number;
  startTime: number | null;
  scenario: DemoScenario;
  isTestMode: boolean;
  zone: string;
  openFlow: () => void;
}) {
  const { language, t } = useLanguage();
  const effectiveLevel = scenario.level;
  return (
    <section className={`status-card ${active ? "active" : effectiveLevel}`}>
      <div className="status-top">
        <span className="status-icon">
          <Icon
            name={active ? "clock" : effectiveLevel === "warning" ? "check" : "shield"}
            size={25}
          />
        </span>
        <div>
          <small>
            {active
              ? t("content.b2126416f95c")
              : effectiveLevel === "blocked"
                ? t("content.2fcc8611ac7e")
                : effectiveLevel === "warning"
                  ? t("content.74599867e791")
                  : t("content.e34b5d51b178")}
          </small>
          <h2>
            {active
              ? t("home.fishingIn", { zone: t(zone).toLowerCase() })
              : t(localizeText(scenario.title, language))}
          </h2>
        </div>
      </div>
      {active ? (
        <>
          <div className="timer">{formatDuration(elapsed)}</div>
          <p>
            {t("copy.startet.bed9f1f")}
            {formatClock(startTime)} · {t(zone)}
          </p>
        </>
      ) : (
        <p>
          {isTestMode
            ? `${selectLocalized(language, "Testsituasjon", "Test scenario")}: ${t(localizeText(scenario.detail, language))}`
            : t(localizeText(scenario.detail, language))}
        </p>
      )}
      <button className={active ? "stop-button" : "start-button"} onClick={openFlow}>
        <Icon name={active ? "clock" : "activity"} size={20} />
        {active
          ? t("content.3efcc8d2e861")
          : effectiveLevel === "blocked"
            ? t("content.46e6fa1c44cc")
            : effectiveLevel === "warning"
              ? t("content.1f04327c989d")
              : t("content.3c7f7c309377")}
      </button>
    </section>
  );
}
