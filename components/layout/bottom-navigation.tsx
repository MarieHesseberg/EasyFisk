import { Icon } from "@/components/ui/icon";
import type { Screen } from "@/domain/navigation/navigation";
import { useLanguage } from "@/components/localization/language-provider";
import type { TranslationKey } from "@/locales";

const destinations = [
  ["home", "navigation.home", "home"],
  ["map", "navigation.map", "map"],
  ["permits", "navigation.permits", "ticket"],
  ["rules", "navigation.rules", "book"],
  ["more", "navigation.more", "more"],
] as const satisfies readonly (readonly [Screen, TranslationKey, string])[];

export function BottomNavigation({
  activeScreen,
  navigate,
}: {
  activeScreen: Screen;
  navigate: (screen: Screen) => void;
}) {
  const { t } = useLanguage();
  const selectedScreen = activeScreen === "stats" ? "more" : activeScreen;
  return (
    <nav className="bottom-nav" aria-label={t("navigation.label")}>
      {destinations.map(([id, labelKey, icon]) => (
        <button
          key={id}
          onClick={() => navigate(id)}
          className={selectedScreen === id ? "selected" : ""}
          aria-current={selectedScreen === id ? "page" : undefined}
        >
          <Icon name={icon} />
          <span>{t(labelKey)}</span>
        </button>
      ))}
    </nav>
  );
}
