"use client";
import { ScreenHeader } from "@/components/ui/screen-header";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import type { ZoneId } from "@/domain/zones/zone";
import { useUserLocation } from "@/features/map/hooks/use-user-location";
import { InteractiveMandalselvaMap } from "@/features/map/interactive-mandalselva-map";
import { useState } from "react";
import { useLanguage } from "@/components/localization/language-provider";
import {
  findMandalselvaZoneAtPosition,
  type MapCoordinate,
} from "@/data/map/mandalselva-zone-boundaries";
const zones = fishingContentRepository.getZones();
export function MapScreen({
  selected,
  setSelected,
  onBuyPermit,
}: {
  selected: ZoneId;
  setSelected: (zone: ZoneId) => void;
  onBuyPermit: () => void;
}) {
  const { t } = useLanguage();
  const [userPosition, setUserPosition] = useState<MapCoordinate | null>(null);
  const location = useUserLocation((position) => {
    setUserPosition(position);
    const locatedZone = findMandalselvaZoneAtPosition(position);
    if (!locatedZone) return t("copy.posisjon.funnet.utenfor.de.registrerte.hovedsone.01eed28");
    setSelected(locatedZone);
    return `${t("copy.posisjon.funnet.sone.61d4ac7")} ${locatedZone}`;
  });
  return (
    <div className="screen map-screen">
      <ScreenHeader
        title={t("copy.fiskesoner.c11a7d8")}
        eyebrow={t("copy.mandalselva.veiledende.kart.678481e")}
      />
      <InteractiveMandalselvaMap
        zones={zones}
        selected={selected}
        setSelected={setSelected}
        userPosition={userPosition}
        onBuyPermit={onBuyPermit}
        locate={location.locate}
        isLocating={location.isLoading}
        locationMessage={location.message}
      />
    </div>
  );
}
