"use client";

import { DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import type { UploadTarget } from "@/lib/types";

export function GlobalUploadModal() {
  const { regions, isUploadOpen, setUploadOpen, uploadFiles, selection } =
    useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [regionId, setRegionId] = useState(selection.regionId);
  const [locationId, setLocationId] = useState("");
  const [hardwareId, setHardwareId] = useState<string>("location");

  useEffect(() => {
    if (!isUploadOpen) return;
    setRegionId(selection.regionId);
    setLocationId(selection.type === "region" ? "" : selection.locationId);
    setHardwareId(
      selection.type === "hardware" ? selection.hardwareId : "location",
    );
    setFiles([]);
  }, [isUploadOpen, selection]);

  const locations = useMemo(
    () => regions.find((region) => region.id === regionId)?.locations ?? [],
    [regions, regionId],
  );

  const hardware = useMemo(
    () =>
      locations.find((location) => location.id === locationId)?.hardware ?? [],
    [locations, locationId],
  );

  if (!isUploadOpen) return null;

  function resetAndClose() {
    setFiles([]);
    setDragging(false);
    setUploadOpen(false);
  }

  function addFiles(list: FileList | null) {
    if (!list?.length) return;
    setFiles((current) => [...current, ...Array.from(list)]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!files.length || !regionId || !locationId) return;

    const target: UploadTarget = {
      regionId,
      locationId,
      hardwareId: hardwareId === "location" ? "location" : hardwareId,
    };
    uploadFiles(target, files);
    resetAndClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close upload modal"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={resetAndClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-title"
        className="animate-fade-in relative w-full max-w-xl rounded-xl border border-border bg-surface shadow-2xl"
      >
        <div className="border-b border-border px-6 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Global Upload
          </p>
          <h2
            id="upload-title"
            className="text-lg font-semibold text-foreground"
          >
            Upload Files
          </h2>
          <p className="mt-1 text-sm text-muted">
            Attach documents, CSV logs, photos, or voice notes to a Region →
            Location → Hardware target.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Region">
              <select
                value={regionId}
                onChange={(event) => {
                  setRegionId(event.target.value);
                  setLocationId("");
                  setHardwareId("location");
                }}
                className={inputClass}
                required
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Location">
              <select
                value={locationId}
                onChange={(event) => {
                  setLocationId(event.target.value);
                  setHardwareId("location");
                }}
                className={inputClass}
                required
              >
                <option value="" disabled>
                  Select location
                </option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Hardware">
              <select
                value={hardwareId}
                onChange={(event) => setHardwareId(event.target.value)}
                className={inputClass}
                disabled={!locationId}
              >
                <option value="location">Site-level (no hardware)</option>
                {hardware.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.category}: {item.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-xl border border-dashed px-4 py-8 text-center transition ${
              dragging
                ? "border-accent bg-accent/10"
                : "border-border-strong bg-background/50"
            }`}
          >
            <p className="text-sm font-medium text-foreground">
              Drag & drop files here
            </p>
            <p className="mt-1 text-xs text-muted">
              Documents, CSV logs, photos, voice notes
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-metallic transition hover:border-accent/40 hover:text-accent"
            >
              Browse Files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.csv,.txt,.doc,.docx,image/*,audio/*"
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </div>

          {files.length > 0 && (
            <ul className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-border bg-surface-elevated/50 p-2">
              {files.map((file) => (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}`}
                  className="truncate px-2 py-1 text-xs text-metallic"
                >
                  {file.name}
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={resetAndClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition hover:border-border-strong hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!files.length || !locationId}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Upload {files.length > 0 ? `(${files.length})` : ""}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-medium uppercase tracking-[0.08em] text-muted">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition focus:border-accent/50 focus:ring-1 focus:ring-accent/30 disabled:opacity-50";
