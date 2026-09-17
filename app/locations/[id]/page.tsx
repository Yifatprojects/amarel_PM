"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AddSiteFilesButton } from "@/components/locations/AddSiteFilesButton";
import { HardwareDrawer } from "@/components/locations/HardwareDrawer";
import {
  countLocationFiles,
  fileKindLabel,
  formatBytes,
  formatTimestamp,
  hardwareStatusClass,
  locationStatusClass,
} from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Hardware } from "@/lib/types";

export default function LocationDetailPage() {
  const params = useParams<{ id: string }>();
  const { getLocation } = useApp();
  const location = getLocation(params.id);
  const [selected, setSelected] = useState<Hardware | null>(null);

  const selectedLive = useMemo(() => {
    if (!location || !selected) return null;
    return location.hardware.find((item) => item.id === selected.id) ?? null;
  }, [location, selected]);

  if (!location) {
    return (
      <div className="animate-fade-in mx-auto max-w-4xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Location not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          The requested trial site is unavailable or has been removed.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg border border-border px-4 py-2 text-sm text-metallic transition hover:border-accent/40 hover:text-accent"
        >
          Back to Locations
        </Link>
      </div>
    );
  }

  const totalFiles = countLocationFiles(location);

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <Link
        href="/"
        className="text-xs font-medium uppercase tracking-[0.14em] text-muted transition hover:text-accent"
      >
        ← Locations
      </Link>

      <header className="mt-4 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-xs text-muted">{location.id}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            {location.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Last updated {formatTimestamp(location.lastUpdated)} · {totalFiles}{" "}
            {totalFiles === 1 ? "file" : "files"} total
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AddSiteFilesButton
            locationId={location.id}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm font-medium text-metallic transition hover:border-accent/40 hover:text-accent"
          />
          <span
            className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${locationStatusClass(location.status)}`}
          >
            {location.status}
          </span>
        </div>
      </header>

      <section className="mt-6">
        <h2 className="text-[11px] uppercase tracking-[0.16em] text-muted">
          Location Metadata
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <MetaCard label="GPS Coordinates" value={location.coordinates} mono />
          <MetaCard label="Access Code" value={location.accessCode} mono />
          <MetaCard label="Terrain Type" value={location.terrain} />
          <MetaCard label="Key Contact" value={location.contactName} />
          <MetaCard label="Contact Phone" value={location.contactPhone} mono />
          <MetaCard
            label="Total Files"
            value={`${totalFiles} ${totalFiles === 1 ? "file" : "files"}`}
          />
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Site Files
            </h2>
            <p className="text-sm text-muted">
              Documents attached directly to this location (
              {location.files?.length ?? 0}).
            </p>
          </div>
          <AddSiteFilesButton locationId={location.id} />
        </div>

        <div className="rounded-xl border border-border bg-surface">
          {(location.files?.length ?? 0) === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              No site-level files yet. Use Add Files to upload documents, logs,
              audio, or photos.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {(location.files ?? []).map((file) => (
                <li
                  key={file.id}
                  className="flex items-start justify-between gap-3 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {fileKindLabel(file.type, file.name)} ·{" "}
                      {formatBytes(file.size)} ·{" "}
                      {formatTimestamp(file.uploadedAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Hardware List
            </h2>
            <p className="text-sm text-muted">
              Select a unit to inspect assignment, notes, and field uploads.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <ul className="divide-y divide-border">
            {location.hardware.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelected(item)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-surface-elevated"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] text-muted">{item.id}</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      {item.name}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Tech: {item.technician} · {item.files.length} files
                    </p>
                  </div>
                  <span
                    className={`inline-flex shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${hardwareStatusClass(item.status)}`}
                  >
                    {item.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {location.hardware.length === 0 && (
            <p className="px-5 py-8 text-center text-sm text-muted">
              No hardware assigned to this location yet.
            </p>
          )}
        </div>
      </section>

      <HardwareDrawer
        locationId={location.id}
        hardware={selectedLive}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

function MetaCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p
        className={`mt-1.5 text-sm text-foreground ${mono ? "font-mono text-xs tracking-wide" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
