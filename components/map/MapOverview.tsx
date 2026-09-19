"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import {
  collectHardwarePins,
  mapPinColor,
  mapPinLabel,
} from "@/lib/format";
import { useApp } from "@/lib/store";
import type { MapHardwarePin, Region } from "@/lib/types";

type Props = {
  regions: Region[];
  regionFilterId?: string;
  onUpload: () => void;
};

export function MapOverview({ regions, regionFilterId, onUpload }: Props) {
  const { setSelection } = useApp();
  const pins = useMemo(
    () => collectHardwarePins(regions, regionFilterId),
    [regions, regionFilterId],
  );

  const title = regionFilterId
    ? regions.find((region) => region.id === regionFilterId)?.name ??
      "Region Map"
    : "Theater Map Overview";

  const counts = useMemo(
    () => ({
      operational: pins.filter((pin) => pin.severity === "operational").length,
      warning: pins.filter((pin) => pin.severity === "warning").length,
      critical: pins.filter((pin) => pin.severity === "critical").length,
    }),
    [pins],
  );

  return (
    <div className="animate-fade-in flex h-full min-h-[640px] flex-col px-4 py-5 lg:px-6">
      <header className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Locations & Map
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground lg:text-3xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Interactive GIS overview of deployed sensors and loggers. Pin color
            reflects live hardware posture across the trial theater.
          </p>
        </div>
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background transition hover:brightness-110"
        >
          <span aria-hidden>+</span>
          Upload Files
        </button>
      </header>

      <div className="mb-4 flex flex-wrap gap-3">
        <LegendSwatch
          color="#10b981"
          label={`Operational (${counts.operational})`}
        />
        <LegendSwatch color="#f59e0b" label={`Warning (${counts.warning})`} />
        <LegendSwatch color="#f43f5e" label={`Critical (${counts.critical})`} />
        <span className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-muted">
          {pins.length} hardware pins
        </span>
      </div>

      <div className="relative min-h-[520px] flex-1 overflow-hidden rounded-xl border border-border bg-surface shadow-[inset_0_1px_0_rgba(197,208,224,0.08)]">
        <LeafletMapCanvas
          pins={pins}
          onOpenDetails={(pin) =>
            setSelection({
              type: "hardware",
              regionId: pin.regionId,
              locationId: pin.locationId,
              hardwareId: pin.hardware.id,
            })
          }
        />
      </div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs text-metallic">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}`,
        }}
      />
      {label}
    </span>
  );
}

function LeafletMapCanvas({
  pins,
  onOpenDetails,
}: {
  pins: MapHardwarePin[];
  onOpenDetails: (pin: MapHardwarePin) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const onOpenRef = useRef(onOpenDetails);
  onOpenRef.current = onOpenDetails;

  useEffect(() => {
    let cancelled = false;

    async function setup() {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([32.5, 20], 3);

      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS",
          maxZoom: 16,
        },
      ).addTo(map);

      mapRef.current = map;
      markersRef.current = createMarkers(L, map, pins, (pin) =>
        onOpenRef.current(pin),
      );
    }

    void setup();

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function refresh() {
      const L = (await import("leaflet")).default;
      const map = mapRef.current;
      if (!map) return;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = createMarkers(L, map, pins, (pin) =>
        onOpenRef.current(pin),
      );
    }
    void refresh();
  }, [pins]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full" />
  );
}

function createMarkers(
  L: typeof import("leaflet"),
  map: LeafletMap,
  pins: MapHardwarePin[],
  onOpenDetails: (pin: MapHardwarePin) => void,
) {
  const markers: Marker[] = [];
  const bounds = L.latLngBounds([]);

  pins.forEach((pin) => {
    const color = mapPinColor(pin.severity);
    const icon = L.divIcon({
      className: "tf-map-pin",
      html: `<span style="
        display:block;width:14px;height:14px;border-radius:9999px;
        background:${color};border:2px solid rgba(15,23,42,0.95);
        box-shadow:0 0 0 3px ${color}55, 0 0 16px ${color};
      "></span>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    const marker = L.marker([pin.hardware.lat, pin.hardware.lng], { icon });
    const root = document.createElement("div");
    root.innerHTML = `
      <div style="font-family:IBM Plex Sans,system-ui,sans-serif;min-width:220px;">
        <div style="font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:4px;">
          ${escapeHtml(pin.regionName)} · ${escapeHtml(pin.locationName)}
        </div>
        <div style="font-size:14px;font-weight:600;color:#e2e8f0;margin-bottom:6px;">
          ${escapeHtml(pin.hardware.name)}
        </div>
        <div style="font-size:12px;color:#cbd5e1;margin-bottom:4px;">
          <span style="color:${color};font-weight:600;">●</span>
          ${escapeHtml(mapPinLabel(pin.severity))} (${escapeHtml(pin.hardware.status)})
        </div>
        <div style="font-size:12px;color:#94a3b8;margin-bottom:10px;">
          Tech: ${escapeHtml(pin.hardware.technician)}<br/>
          ${escapeHtml(pin.hardware.coordinates)}
        </div>
        <button type="button" data-open-details="1" style="
          width:100%;border-radius:8px;border:1px solid #334155;background:#0f172a;
          color:#5eead4;font-size:12px;font-weight:600;padding:8px 10px;cursor:pointer;
        ">Open Details</button>
      </div>
    `;
    root
      .querySelector("[data-open-details]")
      ?.addEventListener("click", () => {
        onOpenDetails(pin);
        map.closePopup();
      });

    marker.bindPopup(root, { className: "tf-map-popup", maxWidth: 280 });
    marker.addTo(map);
    markers.push(marker);
    bounds.extend([pin.hardware.lat, pin.hardware.lng]);
  });

  if (pins.length === 1) {
    map.setView([pins[0].hardware.lat, pins[0].hardware.lng], 11);
  } else if (pins.length > 1 && bounds.isValid()) {
    map.fitBounds(bounds.pad(0.35));
  }

  return markers;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
