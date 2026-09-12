import { Icon } from "@/components/ui/icon";
import { useLanguage } from "@/components/localization/language-provider";
export function HomeShortcuts({
  openMap,
  openRules,
}: {
  openMap: () => void;
  openRules: () => void;
}) {
  const { t } = useLanguage();
  return (
    <section>
      <div className="section-head">
        <h3>{t("copy.snarveier.ff2eb6c")}</h3>
      </div>
      <div className="quick-grid">
        <button onClick={openMap}>
          <Icon name="map" />
          <span>{t("copy.finn.riktig.sone.572ed61")}</span>
        </button>
        <button onClick={openRules}>
          <Icon name="book" />
          <span>{t("copy.regler.for.meg.28f9141")}</span>
        </button>
      </div>
    </section>
  );
}
