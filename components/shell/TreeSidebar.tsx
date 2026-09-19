"use client";

import { useMemo, useState } from "react";
import { countLocationFiles, countRegionFiles } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Hardware, Region, TrialLocation } from "@/lib/types";

export function TreeSidebar() {
  const { regions, selection, setSelection } = useApp();
  const [query, setQuery] = useState("");
  const [expandedRegions, setExpandedRegions] = useState<Record<string, boolean>>(
    () => Object.fromEntries(regions.map((region) => [region.id, true])),
  );
  const [expandedLocations, setExpandedLocations] = useState<
    Record<string, boolean>
  >({});

  const selectedHardwareId =
    selection.type === "hardware" ? selection.hardwareId : null;
  const selectedLocationId =
    selection.type === "location" || selection.type === "hardware"
      ? selection.locationId
      : null;

  const autoExpand = useMemo(() => {
    if (selection.type === "hardware" || selection.type === "location") {
      return selection.locationId;
    }
    return null;
  }, [selection]);

  const filteredRegions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return regions;

    return regions
      .map((region) => {
        const regionMatch = region.name.toLowerCase().includes(q);
        const locations = region.locations
          .map((location) => {
            const locationMatch =
              location.name.toLowerCase().includes(q) ||
              location.status.toLowerCase().includes(q) ||
              location.terrain.toLowerCase().includes(q) ||
              location.accessCode.toLowerCase().includes(q);

            const hardware = location.hardware.filter(
              (item) =>
                item.name.toLowerCase().includes(q) ||
                item.category.toLowerCase().includes(q) ||
                item.status.toLowerCase().includes(q) ||
                item.technician.toLowerCase().includes(q) ||
                item.id.toLowerCase().includes(q),
            );

            if (regionMatch || locationMatch) {
              return location;
            }
            if (hardware.length > 0) {
              return { ...location, hardware };
            }
            return null;
          })
          .filter(Boolean) as TrialLocation[];

        if (regionMatch || locations.length > 0) {
          return {
            ...region,
            locations: regionMatch ? region.locations : locations,
          };
        }
        return null;
      })
      .filter(Boolean) as Region[];
  }, [regions, query]);

  const searching = query.trim().length > 0;

  function toggleRegion(regionId: string) {
    setExpandedRegions((current) => ({
      ...current,
      [regionId]: !current[regionId],
    }));
  }

  function toggleLocation(locationId: string) {
    setExpandedLocations((current) => ({
      ...current,
      [locationId]: !(current[locationId] ?? autoExpand === locationId),
    }));
  }

  function isRegionExpanded(regionId: string) {
    if (searching) return true;
    return expandedRegions[regionId] ?? true;
  }

  function isLocationExpanded(locationId: string) {
    if (searching) return true;
    if (locationId in expandedLocations) return expandedLocations[locationId];
    return autoExpand === locationId;
  }

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
          Theater Tree
        </p>
        <h2 className="mt-1 text-sm font-semibold text-foreground">
          Regions · Locations · Hardware
        </h2>

        <div className="relative mt-3">
          <label htmlFor="tree-search" className="sr-only">
            Search regions, locations, and hardware
          </label>
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            <SearchIcon />
          </span>
          <input
            id="tree-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tree…"
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted/70 focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
        </div>

        <button
          type="button"
          onClick={() => setSelection({ type: "map" })}
          className={`mt-3 w-full rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
            selection.type === "map"
              ? "bg-accent/10 text-accent ring-1 ring-accent/25"
              : "border border-border text-metallic hover:border-accent/35 hover:text-accent"
          }`}
        >
          Theater Map Overview
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredRegions.length === 0 && (
          <p className="px-3 py-6 text-center text-xs text-muted">
            No matches for “{query.trim()}”.
          </p>
        )}

        {filteredRegions.map((region) => {
          const regionOpen = isRegionExpanded(region.id);
          const regionActive =
            selection.type === "region" && selection.regionId === region.id;

          return (
            <div key={region.id} className="mb-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={regionOpen ? "Collapse region" : "Expand region"}
                  onClick={() => toggleRegion(region.id)}
                  className="rounded px-1.5 py-1 text-muted transition hover:bg-surface-elevated hover:text-foreground"
                >
                  <Chevron open={regionOpen} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExpandedRegions((c) => ({ ...c, [region.id]: true }));
                    setSelection({ type: "region", regionId: region.id });
                  }}
                  className={`flex min-w-0 flex-1 items-center justify-between rounded-lg px-2 py-2 text-left text-sm transition ${
                    regionActive
                      ? "bg-accent/10 text-accent ring-1 ring-accent/25"
                      : "text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  <span className="truncate font-semibold">{region.name}</span>
                  <span className="ml-2 shrink-0 font-mono text-[10px] text-muted">
                    {countRegionFiles(region)}
                  </span>
                </button>
              </div>

              {regionOpen && (
                <div className="ml-3 border-l border-border pl-2">
                  {region.locations.map((location) => (
                    <LocationNode
                      key={location.id}
                      regionId={region.id}
                      location={location}
                      expanded={isLocationExpanded(location.id)}
                      selectedLocationId={selectedLocationId}
                      selectedHardwareId={selectedHardwareId}
                      onToggle={() => toggleLocation(location.id)}
                      onSelectLocation={() => {
                        setExpandedLocations((c) => ({
                          ...c,
                          [location.id]: true,
                        }));
                        setSelection({
                          type: "location",
                          regionId: region.id,
                          locationId: location.id,
                        });
                      }}
                      onSelectHardware={(hardwareId) => {
                        setExpandedLocations((c) => ({
                          ...c,
                          [location.id]: true,
                        }));
                        setSelection({
                          type: "hardware",
                          regionId: region.id,
                          locationId: location.id,
                          hardwareId,
                        });
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}

function LocationNode({
  regionId,
  location,
  expanded,
  selectedLocationId,
  selectedHardwareId,
  onToggle,
  onSelectLocation,
  onSelectHardware,
}: {
  regionId: string;
  location: TrialLocation;
  expanded: boolean;
  selectedLocationId: string | null;
  selectedHardwareId: string | null;
  onToggle: () => void;
  onSelectLocation: () => void;
  onSelectHardware: (hardwareId: string) => void;
}) {
  void regionId;
  const active = selectedLocationId === location.id && !selectedHardwareId;
  const sensors = location.hardware.filter((item) => item.category === "Sensor");
  const loggers = location.hardware.filter((item) => item.category === "Logger");

  return (
    <div className="mb-0.5">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={expanded ? "Collapse location" : "Expand location"}
          onClick={onToggle}
          className="rounded px-1 py-1 text-muted transition hover:bg-surface-elevated hover:text-foreground"
        >
          <Chevron open={expanded} small />
        </button>
        <button
          type="button"
          onClick={onSelectLocation}
          className={`flex min-w-0 flex-1 items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px] transition ${
            active
              ? "bg-accent/10 text-accent ring-1 ring-accent/20"
              : "text-metallic hover:bg-surface-elevated hover:text-foreground"
          }`}
        >
          <span className="truncate">{location.name}</span>
          <span className="ml-2 shrink-0 font-mono text-[10px] text-muted">
            {countLocationFiles(location)}
          </span>
        </button>
      </div>

      {expanded && (
        <div className="ml-4 mt-1 space-y-2 border-l border-border/80 pl-2 pb-2">
          <HardwareGroup
            title="Sensors"
            items={sensors}
            selectedHardwareId={selectedHardwareId}
            onSelect={onSelectHardware}
          />
          <HardwareGroup
            title="Loggers"
            items={loggers}
            selectedHardwareId={selectedHardwareId}
            onSelect={onSelectHardware}
          />
        </div>
      )}
    </div>
  );
}

function HardwareGroup({
  title,
  items,
  selectedHardwareId,
  onSelect,
}: {
  title: string;
  items: Hardware[];
  selectedHardwareId: string | null;
  onSelect: (hardwareId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = selectedHardwareId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition ${
                  active
                    ? "bg-accent/10 text-accent ring-1 ring-accent/20"
                    : "text-muted hover:bg-surface-elevated hover:text-foreground"
                }`}
              >
                <span className="truncate">{item.name}</span>
                <span className="ml-2 shrink-0 font-mono text-[10px] opacity-70">
                  {item.files.length}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m10.5 10.5 3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Chevron({ open, small }: { open: boolean; small?: boolean }) {
  return (
    <svg
      className={`${small ? "h-3 w-3" : "h-3.5 w-3.5"} transition ${open ? "rotate-90" : ""}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 3.5 10.5 8 6 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
