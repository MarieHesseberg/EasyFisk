import { FlowTitle } from "@/components/ui/flow-title";
import { Icon } from "@/components/ui/icon";
import { useLanguage } from "@/components/localization/language-provider";

export function PositionStep({ back, next }: { back: () => void; next: () => void }) {
  const { t } = useLanguage();
  return (
    <>
      <FlowTitle
        icon="pin"
        eyebrow={t("copy.posisjon.7733e25")}
        title={t("copy.finn.riktig.fiskesone.33661af")}
        text={t("location.singleUse")}
      />
      <div className="permission-card">
        <Icon name="pin" size={30} />
        <b>{t("copy.tillat.posisjon.nar.du.starter.8b37ef3")}</b>
        <p>{t("copy.easyfisk.lagrer.bare.sone.og.valgfri.startposisj.9daf0dd")}</p>
      </div>
      <button className="primary" onClick={next}>
        {t("copy.tillat.og.finn.sone.3fbbe01")}
      </button>
      <button className="secondary" onClick={next}>
        {t("copy.velg.sone.manuelt.ad41072")}
      </button>
      <button className="text-button" onClick={back}>
        {t("copy.tilbake.4fb8dc1")}
      </button>
    </>
  );
}
