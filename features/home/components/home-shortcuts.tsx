import { Icon } from "@/components/ui/icon";
export function HomeShortcuts({
  openPastSession,
  openMap,
  openRules,
}: {
  openPastSession: () => void;
  openMap: () => void;
  openRules: () => void;
}) {
  return (
    <section>
      <div className="section-head">
        <h3>Snarveier</h3>
      </div>
      <div className="quick-grid">
        <button onClick={openPastSession}>
          <Icon name="clock" />
          <span>Registrer tidligere fisketur</span>
        </button>
        <button onClick={openMap}>
          <Icon name="map" />
          <span>Finn riktig sone</span>
        </button>
        <button onClick={openRules}>
          <Icon name="book" />
          <span>Regler for meg</span>
        </button>
      </div>
    </section>
  );
}
