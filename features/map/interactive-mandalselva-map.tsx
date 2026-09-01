"use client";

import { useEffect, useRef, useState } from "react";
import type { CircleMarker, Map as LeafletMap, Polygon } from "leaflet";
import {
  mandalselvaMapBounds,
  mandalselvaMapZones,
  type MapCoordinate,
} from "@/data/map/mandalselva-zone-boundaries";
import type { FishingZone, ZoneId } from "@/domain/zones/zone";

const tileUrl = "https://{s}-kartcache.nrk.no/tiles/ut_topo_light/{z}/{x}/{y}.jpg";

export function InteractiveMandalselvaMap({
  zones,
  selected,
  setSelected,
  userPosition,
}: {
  zones: readonly FishingZone[];
  selected: ZoneId;
  setSelected: (zone: ZoneId) => void;
  userPosition: MapCoordinate | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const polygonRefs = useRef(new Map<ZoneId, Polygon>());
  const userMarkerRef = useRef<CircleMarker | null>(null);
  const setSelectedRef = useRef(setSelected);
  const initialSelectedRef = useRef(selected);
  const [showDetails, setShowDetails] = useState(true);
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
        minZoom: 9,
        maxZoom: 16,
      });
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
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: zone.id === initialSelectedRef.current ? 0.28 : 0.12,
            opacity: 1,
            weight: zone.id === initialSelectedRef.current ? 5 : 3,
          })
          .addTo(map)
          .on("click", () => {
            setSelectedRef.current(zone.id);
            setShowDetails(true);
          });
        polygon.bindTooltip(`Sone ${zone.id}`, { sticky: true, direction: "top" });
        polygons.set(zone.id, polygon);
      }

      map.fitBounds(mandalselvaMapBounds, { padding: [12, 12] });
      mapRef.current = map;
    });

    return () => {
      isCancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      polygons.clear();
    };
  }, []);

  useEffect(() => {
    for (const zone of mandalselvaMapZones) {
      polygonRefs.current.get(zone.id)?.setStyle({
        fillOpacity: zone.id === selected ? 0.28 : 0.1,
        weight: zone.id === selected ? 5 : 3,
      });
    }
    const selectedBoundary = mandalselvaMapZones.find((zone) => zone.id === selected)?.boundary;
    if (selectedBoundary && mapRef.current) {
      mapRef.current.fitBounds(selectedBoundary, { padding: [34, 34], maxZoom: 12 });
    }
  }, [selected]);

  useEffect(() => {
    if (!mapRef.current || !userPosition) return;
    void import("leaflet").then((leaflet) => {
      userMarkerRef.current?.remove();
      userMarkerRef.current = leaflet
        .circleMarker(userPosition, {
          radius: 8,
          color: "#e3f2fd",
          fillColor: "#b3261e",
          fillOpacity: 1,
          weight: 3,
        })
        .bindTooltip("Din posisjon")
        .addTo(mapRef.current!);
      mapRef.current?.panTo(userPosition);
    });
  }, [userPosition]);

  function showEntireRiver() {
    mapRef.current?.fitBounds(mandalselvaMapBounds, { padding: [12, 12] });
    setShowDetails(false);
  }

  function selectZone(zoneId: ZoneId) {
    setSelected(zoneId);
    setShowDetails(true);
  }

  return (
    <section className="interactive-river-map" aria-label="Interaktivt kart over Mandalselva">
      <div className="map-zone-switcher" aria-label="Velg hovedsone">
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            aria-pressed={zone.id === selected}
            onClick={() => selectZone(zone.id)}
          >
            Sone {zone.id}
          </button>
        ))}
        <button type="button" onClick={showEntireRiver}>
          Hele elva
        </button>
      </div>
      <div
        ref={containerRef}
        className="leaflet-map-canvas"
        aria-label="Kart med grensene for fiskesone 1 til 4"
      />
      {showDetails && selectedZone && (
        <article className="map-zone-popup" aria-live="polite">
          <button
            type="button"
            className="map-zone-popup-close"
            aria-label="Lukk soneinformasjon"
            onClick={() => setShowDetails(false)}
          >
            ×
          </button>
          <small>VALGT FISKEOMRÅDE</small>
          <h2>{selectedZone.name}</h2>
          <p>{selectedZone.desc}</p>
          <a
            href={mandalselvaMapZones.find((zone) => zone.id === selected)?.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            Se offisiell soneinformasjon ↗
          </a>
        </article>
      )}
      <p className="map-source-note">
        Sonegrensene er basert på koordinatene i Norske Lakseelvers publiserte kart. Fysisk
        oppmerking langs elva gjelder ved avvik.
      </p>
    </section>
  );
}
