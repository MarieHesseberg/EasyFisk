import { Icon } from "@/components/ui/icon";
import type { Screen } from "@/domain/navigation/navigation";

const destinations = [
  ["home", "Hjem", "home"],
  ["map", "Kart", "map"],
  ["permits", "Fiskekort", "ticket"],
  ["rules", "Regler", "book"],
  ["more", "Mer", "more"],
] as const;

export function BottomNavigation({
  activeScreen,
  navigate,
}: {
  activeScreen: Screen;
  navigate: (screen: Screen) => void;
}) {
  const selectedScreen = activeScreen === "stats" ? "more" : activeScreen;
  return (
    <nav className="bottom-nav" aria-label="Hovednavigasjon">
      {destinations.map(([id, label, icon]) => (
        <button
          key={id}
          onClick={() => navigate(id)}
          className={selectedScreen === id ? "selected" : ""}
          aria-current={selectedScreen === id ? "page" : undefined}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
