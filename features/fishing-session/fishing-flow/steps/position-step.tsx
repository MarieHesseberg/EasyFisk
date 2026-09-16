import { useUserLocation } from "@/features/map/hooks/use-user-location";
import { findMandalselvaZoneAtPosition } from "@/data/map/mandalselva-zone-boundaries";
import type { ZoneId } from "@/domain/zones/zone";
import { FlowTitle } from "@/components/ui/flow-title";
import { Icon } from "@/components/ui/icon";
import { useLanguage } from "@/components/localization/language-provider";

export function PositionStep({ back, next }: { back: () => void; next: (zone?: ZoneId) => void }) {
  const { t } = useLanguage();
  const location = useUserLocation((position) => {
    const zone = findMandalselvaZoneAtPosition(position);
    if (!zone) return t("copy.posisjon.funnet.utenfor.de.registrerte.hovedsone.01eed28");
    next(zone);
  });
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
        <p>{t("location.singleUse")}</p>
      </div>
      {location.message && <p role="status">{location.message}</p>}
      <button className="primary" disabled={location.isLoading} onClick={location.locate}>
        {t("copy.tillat.og.finn.sone.3fbbe01")}
      </button>
      <button className="secondary" onClick={() => next()}>
        {t("copy.velg.sone.manuelt.ad41072")}
      </button>
      <button className="text-button" onClick={back}>
        {t("copy.tilbake.4fb8dc1")}
      </button>
    </>
  );
}
