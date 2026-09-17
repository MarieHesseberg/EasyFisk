"use client";

import { useEffect, useRef, useState } from "react";
import type { CircleMarker, Map as LeafletMap, Polygon } from "leaflet";
import {
  mandalselvaMapBounds,
  mandalselvaMapZones,
  type MapCoordinate,
} from "@/data/map/mandalselva-zone-boundaries";
import type { FishingZone, ZoneId } from "@/domain/zones/zone";
import { Icon } from "@/components/ui/icon";
import { useLanguage } from "@/components/localization/language-provider";

const tileUrl = "https://{s}-kartcache.nrk.no/tiles/ut_topo_light/{z}/{x}/{y}.jpg";

export function InteractiveMandalselvaMap({
  zones,
  selected,
  setSelected,
  userPosition,
  onBuyPermit,
  locate,
  isLocating,
  locationMessage,
}: {
  zones: readonly FishingZone[];
  selected: ZoneId;
  setSelected: (zone: ZoneId) => void;
  userPosition: MapCoordinate | null;
  onBuyPermit?: () => void;
  locate?: () => void;
  isLocating?: boolean;
  locationMessage?: string;
}) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const polygonRefs = useRef(new Map<ZoneId, Polygon>());
  const userMarkerRef = useRef<CircleMarker | null>(null);
  const setSelectedRef = useRef(setSelected);
  const initialSelectedRef = useRef(selected);
  const [showDetails, setShowDetails] = useState(false);
  const selectedZone = zones.find((zone) => zone.id === selected) ?? zones[0];

  useEffect(() => {
    setSelectedRef.current = setSelected;
  }, [setSelected]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let isCancelled = false;
    const polygons = polygonRefs.current;

    void import("leaflet").then((leaflet) => {
      if (isCancelled || !containerRef.current || mapRef.current) return;
      const map = leaflet.map(containerRef.current, {
        zoomControl: false,
        attributionControl: true,
        scrollWheelZoom: false,
        zoomAnimation: false,
        minZoom: 9,
        maxZoom: 16,
      });
      map.on("click", () => setShowDetails(false));
      leaflet.control.zoom({ position: "bottomright" }).addTo(map);
      leaflet
        .tileLayer(tileUrl, {
          subdomains: ["a", "b", "c"],
          attribution: "Kartdata © Kartverket",
          maxZoom: 16,
        })
        .addTo(map);

      for (const zone of mandalselvaMapZones) {
        const polygon = leaflet
          .polygon(zone.boundary, {
            bubblingMouseEvents: false,
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: zone.id === initialSelectedRef.current ? 0.28 : 0.12,
            opacity: 1,
            weight: zone.id === initialSelectedRef.current ? 5 : 3,
          })
          .addTo(map)
          .on("click", () => {
            setSelectedRef.current(zone.id);
            setShowDetails((open) => !open);
          });
        polygon.bindTooltip(`${t("copy.sone.44f1e2e")} ${zone.id}`, {
          sticky: true,
          direction: "top",
        });
        polygons.set(zone.id, polygon);
      }

      map.fitBounds(mandalselvaMapBounds, { padding: [12, 12], animate: false });
      mapRef.current = map;
    });

    return () => {
      isCancelled = true;
      mapRef.current?.stop();
      mapRef.current?.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      polygons.clear();
    };
  }, [t]);

  useEffect(() => {
    for (const zone of mandalselvaMapZones) {
      polygonRefs.current.get(zone.id)?.setStyle({
        fillOpacity: zone.id === selected ? 0.28 : 0.1,
        weight: zone.id === selected ? 5 : 3,
      });
    }
    const selectedBoundary = mandalselvaMapZones.find((zone) => zone.id === selected)?.boundary;
    if (selectedBoundary && mapRef.current) {
      mapRef.current.fitBounds(selectedBoundary, {
        padding: [34, 34],
        maxZoom: 12,
        animate: false,
      });
    }
  }, [selected]);

  useEffect(() => {
    if (!mapRef.current || !userPosition) return;
    const map = mapRef.current;
    let cancelled = false;
    void import("leaflet").then((leaflet) => {
      if (cancelled || mapRef.current !== map) return;
      userMarkerRef.current?.remove();
      userMarkerRef.current = leaflet
        .circleMarker(userPosition, {
          radius: 8,
          color: "#ffffff",
          fillColor: "#b64b43",
          fillOpacity: 1,
          weight: 3,
        })
        .bindTooltip(t("copy.din.posisjon.90b81f2"))
        .addTo(map);
      map.panTo(userPosition, { animate: false });
    });
    return () => {
      cancelled = true;
    };
  }, [t, userPosition]);

  function selectZone(zoneId: ZoneId) {
    setSelected(zoneId);
    setShowDetails(true);
  }

  return (
    <section
      className="interactive-river-map"
      aria-label={t("copy.interaktivt.kart.over.mandalselva.6c7ebf7")}
    >
      <div className="map-zone-switcher" aria-label={t("copy.velg.hovedsone.05c8f59")}>
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            aria-pressed={zone.id === selected}
            onClick={() => selectZone(zone.id)}
          >
            {t("copy.sone.44f1e2e")} {zone.id}
          </button>
        ))}
      </div>
      <div
        ref={containerRef}
        className="leaflet-map-canvas"
        aria-label={t("copy.kart.med.grensene.for.fiskesone.1.til.4.3182034")}
      />
      {showDetails && selectedZone && (
        <article className="map-zone-popup" aria-live="polite">
          {onBuyPermit && (
            <button className="primary map-buy-permit" onClick={onBuyPermit}>
              {t("copy.se.og.velg.fiskekort.i.sone.de70e36")} {selectedZone.id}
            </button>
          )}
        </article>
      )}
      {locate && (
        <div className="map-location-controls">
          <button className="secondary" onClick={locate} disabled={isLocating}>
            <Icon name="pin" size={18} />
            {t(isLocating ? "location.loading" : "content.2cfe36db276e")}
          </button>
          {locationMessage && (
            <div className="map-location-status" role="status">
              {locationMessage}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
