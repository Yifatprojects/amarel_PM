"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AddLocationModal } from "@/components/locations/AddLocationModal";
import { AddSiteFilesButton } from "@/components/locations/AddSiteFilesButton";
import {
  countLocationFiles,
  formatTimestamp,
  locationStatusClass,
} from "@/lib/format";
import { useApp } from "@/lib/store";
import type { LocationStatus } from "@/lib/types";

const statusFilters: Array<"All" | LocationStatus> = [
  "All",
  "Active",
  "Standby",
  "Debrief",
  "Offline",
];

export default function LocationsPage() {
  const { locations } = useApp();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | LocationStatus>("All");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return locations.filter((location) => {
      const matchesStatus = status === "All" || location.status === status;
      const matchesQuery =
        !q ||
        location.name.toLowerCase().includes(q) ||
        location.status.toLowerCase().includes(q) ||
        location.terrain.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [locations, query, status]);

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
            Dashboard
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Location Overview
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Monitor active trial sites, hardware posture, and field readiness
            across the operational theater.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background transition hover:brightness-110"
        >
          <span aria-hidden>+</span>
          Add New Location
        </button>
      </header>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <label htmlFor="location-search" className="sr-only">
            Search locations
          </label>
          <input
            id="location-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or status…"
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted/70 focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setStatus(filter)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                status === filter
                  ? "bg-accent/15 text-accent ring-1 ring-accent/30"
                  : "border border-border text-muted hover:border-border-strong hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((location) => {
          const fileCount = countLocationFiles(location);

          return (
            <article
              key={location.id}
              className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition hover:border-accent/35 hover:bg-surface-elevated"
            >
              <Link href={`/locations/${location.id}`} className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] text-muted">
                      {location.id}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-foreground group-hover:text-accent">
                      {location.name}
                    </h2>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${locationStatusClass(location.status)}`}
                  >
                    {location.status}
                  </span>
                </div>

                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Terrain</dt>
                    <dd className="text-metallic">{location.terrain}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Hardware</dt>
                    <dd className="text-metallic">
                      {location.hardware.length} units
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Files</dt>
                    <dd className="text-metallic">
                      {fileCount} {fileCount === 1 ? "file" : "files"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Updated</dt>
                    <dd className="text-right text-xs text-muted">
                      {formatTimestamp(location.lastUpdated)}
                    </dd>
                  </div>
                </dl>
              </Link>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
                <p className="text-xs text-muted">
                  Site + hardware uploads
                </p>
                <AddSiteFilesButton locationId={location.id} />
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="mt-10 rounded-xl border border-dashed border-border-strong px-6 py-12 text-center">
          <p className="text-sm text-muted">
            No locations match the current search or filter.
          </p>
        </div>
      )}

      <AddLocationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
