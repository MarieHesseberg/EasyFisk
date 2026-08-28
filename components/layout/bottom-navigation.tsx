import { Icon } from "@/components/ui/icon";
import type { Screen } from "@/domain/navigation/navigation";

const destinations = [
  ["home", "Hjem", "home"],
  ["map", "Kart", "map"],
  ["rules", "Regler", "book"],
  ["stats", "Statistikk", "stats"],
  ["more", "Mer", "more"],
] as const;

export function BottomNavigation({
  activeScreen,
  hasActiveSession,
  navigate,
}: {
  activeScreen: Screen;
  hasActiveSession: boolean;
  navigate: (screen: Screen) => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="Hovednavigasjon">
      {destinations.map(([id, label, icon]) => (
        <button
          key={id}
          onClick={() => navigate(id)}
          className={activeScreen === id ? "selected" : ""}
          aria-current={activeScreen === id ? "page" : undefined}
        >
          <Icon name={icon} />
          <span>{label}</span>
          {id === "stats" && hasActiveSession && <i />}
        </button>
      ))}
    </nav>
  );
}
