"use client";
import { ScreenHeader } from "@/components/ui/screen-header";
import { activeFishingRules } from "@/domain/fishing-rules/mandalselva-2026";
import { Icon } from "@/components/ui/icon";
import { fishingContentRepository } from "@/data/repositories/fishing-content";
import { permitCatalogRepository } from "@/data/repositories/permit-catalog";
import type { ZoneId } from "@/domain/zones/zone";
import { formatPrototypePermitPrice } from "@/domain/fishing-permits/prototype-permit-product";
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
  onUseZone,
  onBuyPermit,
}: {
  selected: ZoneId;
  setSelected: (zone: ZoneId) => void;
  onUseZone: (zone: ZoneId) => void;
  onBuyPermit: () => void;
}) {
  const { language, t } = useLanguage();
  const z = fishingContentRepository.findZone(selected) ?? zones[0];
  const permitProducts = permitCatalogRepository.listProductsByZone(z.id);
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
      />
      <div className="map-location-controls">
        <button className="secondary" onClick={location.locate} disabled={location.isLoading}>
          <Icon name="pin" /> {t(location.isLoading ? "location.loading" : "content.2cfe36db276e")}
        </button>
        {location.message && (
          <div className="map-location-status" role="status">
            {location.message}
          </div>
        )}
      </div>
      <article className="zone-sheet">
        <div className="sheet-handle" />
        <div className="zone-title">
          <span style={{ background: z.color }}>{z.id}</span>
          <div>
            <small>{t(z.status.toUpperCase())}</small>
            <h2>{t(z.name)}</h2>
          </div>
        </div>
        <p className="zone-desc">{t(z.desc)}</p>
        <div className="zone-facts">
          <div>
            <small>
              {t("content.72c28a5ab72d")} {activeFishingRules.metadata.seasonYear}
            </small>
            <b>{t(z.season)}</b>
          </div>
          <div>
            <small>{t("copy.omfang.2b0b014")}</small>
            <b>{t(z.note)}</b>
          </div>
        </div>
        <section className="map-permit-products" aria-labelledby="map-permit-products-title">
          <div className="map-permit-heading">
            <div>
              <small>{t("copy.prototypeutvalg.55cdf18")}</small>
              <h3 id="map-permit-products-title">{t("copy.fiskekort.i.sonen.3f1f12a")}</h3>
            </div>
            <span>{t("copy.kontrollert.01.09.2026.d34ecaf")}</span>
          </div>
          <div className="map-permit-list">
            {permitProducts.map((product) => (
              <article key={product.id}>
                <div>
                  <small>{t(product.areaName)}</small>
                  <h4>{t(product.title)}</h4>
                </div>
                <b>{formatPrototypePermitPrice(product, language)}</b>
                <p>{t(product.validity.label)}</p>
                <p>{t(product.capacity.label)}</p>
                <p>{t(product.note)}</p>
                <a href={product.source.url} target="_blank" rel="noreferrer">
                  {t("copy.kontroller.kilde.b98dfe7")}
                </a>
              </article>
            ))}
          </div>
          <p className="map-permit-disclaimer">
            {t("copy.produktdataene.er.et.datert.yeblikksbilde.tilgje.8ec2601")}
          </p>
          <button className="primary" onClick={onBuyPermit}>
            {t("copy.se.og.velg.fiskekort.i.sone.de70e36")} {z.id}
          </button>
        </section>
        <p className="zone-note">
          <Icon name="book" size={19} />
          {t("copy.kartet.er.veiledende.fysisk.oppmerking.og.lokale.caf2402")}
        </p>
        <button className="primary" onClick={() => onUseZone(z.id)}>
          {t("map.useZone", { number: z.id })}
        </button>
      </article>
    </div>
  );
}
