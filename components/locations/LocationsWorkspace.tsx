"use client";

import { useEffect, useState } from "react";
import {
  countLocationFiles,
  countRegionFiles,
  fileKindLabel,
  formatBytes,
  formatTimestamp,
  hardwareStatusClass,
  locationStatusClass,
} from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Hardware, Region, TrialLocation, UploadedFile } from "@/lib/types";

export function LocationsWorkspace() {
  const { selection, setSelection, setUploadOpen, getRegion } =
    useApp();

  const region = getRegion(selection.regionId);
  const location =
    selection.type === "location" || selection.type === "hardware"
      ? region?.locations.find((item) => item.id === selection.locationId)
      : undefined;
  const hardware =
    selection.type === "hardware"
      ? location?.hardware.find((item) => item.id === selection.hardwareId)
      : undefined;

  if (!region) {
    return (
      <div className="p-8 text-sm text-muted">Select a region to begin.</div>
    );
  }

  if (selection.type === "hardware" && location && hardware) {
    return (
      <HardwareDetail
        region={region}
        location={location}
        hardware={hardware}
        onUpload={() => setUploadOpen(true)}
      />
    );
  }

  if (selection.type === "location" && location) {
    return (
      <LocationDetail
        region={region}
        location={location}
        onSelectHardware={(hardwareId) =>
          setSelection({
            type: "hardware",
            regionId: region.id,
            locationId: location.id,
            hardwareId,
          })
        }
        onUpload={() => setUploadOpen(true)}
      />
    );
  }

  return (
    <RegionDetail
      region={region}
      onSelectLocation={(locationId) =>
        setSelection({
          type: "location",
          regionId: region.id,
          locationId,
        })
      }
      onUpload={() => setUploadOpen(true)}
    />
  );
}

function RegionDetail({
  region,
  onSelectLocation,
  onUpload,
}: {
  region: Region;
  onSelectLocation: (locationId: string) => void;
  onUpload: () => void;
}) {
  const fileCount = countRegionFiles(region);
  const hardwareCount = region.locations.reduce(
    (sum, location) => sum + location.hardware.length,
    0,
  );

  return (
    <div className="animate-fade-in mx-auto max-w-5xl px-6 py-8 lg:px-8">
      <Header
        eyebrow="Region"
        title={region.name}
        subtitle={`${region.locations.length} trial locations · ${hardwareCount} hardware units · ${fileCount} files`}
        onUpload={onUpload}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="Locations" value={String(region.locations.length)} />
        <Stat label="Hardware" value={String(hardwareCount)} />
        <Stat label="Files" value={String(fileCount)} />
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">
          Trial Locations
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {region.locations.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => onSelectLocation(location.id)}
              className="rounded-xl border border-border bg-surface p-4 text-left transition hover:border-accent/35 hover:bg-surface-elevated"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground">{location.name}</h3>
                <span
                  className={`rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${locationStatusClass(location.status)}`}
                >
                  {location.status}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted">
                {location.hardware.length} hardware ·{" "}
                {countLocationFiles(location)} files · {location.terrain}
              </p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function LocationDetail({
  region,
  location,
  onSelectHardware,
  onUpload,
}: {
  region: Region;
  location: TrialLocation;
  onSelectHardware: (hardwareId: string) => void;
  onUpload: () => void;
}) {
  const sensors = location.hardware.filter((item) => item.category === "Sensor");
  const loggers = location.hardware.filter((item) => item.category === "Logger");
  const totalFiles = countLocationFiles(location);

  return (
    <div className="animate-fade-in mx-auto max-w-5xl px-6 py-8 lg:px-8">
      <Header
        eyebrow={`${region.name} · Location`}
        title={location.name}
        subtitle={`Updated ${formatTimestamp(location.lastUpdated)} · ${totalFiles} files`}
        badge={location.status}
        badgeClass={locationStatusClass(location.status)}
        onUpload={onUpload}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Meta label="GPS Coordinates" value={location.coordinates} mono />
        <Meta label="Access Code" value={location.accessCode} mono />
        <Meta label="Terrain" value={location.terrain} />
        <Meta label="Key Contact" value={location.contactName} />
        <Meta label="Phone" value={location.contactPhone} mono />
        <Meta label="Total Files" value={`${totalFiles}`} />
      </div>

      <FileList title="Site Files" files={location.files ?? []} />

      <HardwareSection
        title="Sensors"
        items={sensors}
        onSelect={onSelectHardware}
      />
      <HardwareSection
        title="Loggers"
        items={loggers}
        onSelect={onSelectHardware}
      />
    </div>
  );
}

function HardwareDetail({
  region,
  location,
  hardware,
  onUpload,
}: {
  region: Region;
  location: TrialLocation;
  hardware: Hardware;
  onUpload: () => void;
}) {
  const { updateHardwareNotes } = useApp();
  const [notes, setNotes] = useState(hardware.notes);

  useEffect(() => {
    setNotes(hardware.notes);
  }, [hardware.id, hardware.notes]);

  return (
    <div className="animate-fade-in mx-auto max-w-5xl px-6 py-8 lg:px-8">
      <Header
        eyebrow={`${region.name} · ${location.name} · ${hardware.category}`}
        title={hardware.name}
        subtitle={hardware.id}
        badge={hardware.status}
        badgeClass={hardwareStatusClass(hardware.status)}
        onUpload={onUpload}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Meta label="Field Technician" value={hardware.technician} />
        <Meta label="Coordinates" value={hardware.coordinates} mono />
        <div className="sm:col-span-2">
          <Meta label="Placement Notes" value={hardware.placementNotes} />
        </div>
      </div>

      <section className="mt-8">
        <label
          htmlFor="hw-notes"
          className="mb-2 block text-[11px] uppercase tracking-[0.14em] text-muted"
        >
          Editable Notes
        </label>
        <textarea
          id="hw-notes"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
        />
        <button
          type="button"
          onClick={() => updateHardwareNotes(location.id, hardware.id, notes)}
          className="mt-2 rounded-lg border border-border-strong px-3 py-1.5 text-xs font-medium text-metallic transition hover:border-accent/40 hover:text-accent"
        >
          Save Notes
        </button>
      </section>

      <FileList title="Hardware Files" files={hardware.files ?? []} />
    </div>
  );
}

function HardwareSection({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: Hardware[];
  onSelect: (hardwareId: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-surface-elevated"
              >
                <div className="min-w-0">
                  <p className="font-mono text-[11px] text-muted">{item.id}</p>
                  <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {item.technician} · {item.files.length} files
                  </p>
                </div>
                <span
                  className={`rounded-md px-2 py-1 text-[11px] font-medium ring-1 ring-inset ${hardwareStatusClass(item.status)}`}
                >
                  {item.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FileList({ title, files }: { title: string; files: UploadedFile[] }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="mt-3 rounded-xl border border-border bg-surface">
        {files.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No files attached yet. Use Upload Files to add artifacts.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {files.map((file) => (
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
                    {formatBytes(file.size)} · {formatTimestamp(file.uploadedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Header({
  eyebrow,
  title,
  subtitle,
  badge,
  badgeClass,
  onUpload,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeClass?: string;
  onUpload: () => void;
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {badge && badgeClass && (
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badgeClass}`}
          >
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={onUpload}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background transition hover:brightness-110"
        >
          <span aria-hidden>+</span>
          Upload Files
        </button>
      </div>
    </header>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function Meta({
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
