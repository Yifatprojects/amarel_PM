"use client";

import { useEffect, useState } from "react";
import { FileUploadZone } from "@/components/locations/FileUploadZone";
import { hardwareStatusClass } from "@/lib/format";
import { useApp } from "@/lib/store";
import type { Hardware } from "@/lib/types";

type Props = {
  locationId: string;
  hardware: Hardware | null;
  onClose: () => void;
};

export function HardwareDrawer({ locationId, hardware, onClose }: Props) {
  const { updateHardwareNotes, addHardwareFiles } = useApp();
  const [notes, setNotes] = useState(hardware?.notes ?? "");

  useEffect(() => {
    setNotes(hardware?.notes ?? "");
  }, [hardware]);

  if (!hardware) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close hardware drawer overlay"
        className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="animate-slide-in-right relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-2xl">
        <header className="border-b border-border px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs text-muted">{hardware.id}</p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                {hardware.name}
              </h2>
              <span
                className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${hardwareStatusClass(hardware.status)}`}
              >
                {hardware.status}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-2.5 py-1.5 text-sm text-muted transition hover:border-border-strong hover:text-foreground"
            >
              Close
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <section className="grid gap-3 sm:grid-cols-2">
            <Meta label="Field Technician" value={hardware.technician} />
            <Meta label="Coordinates" value={hardware.coordinates} mono />
            <div className="sm:col-span-2">
              <Meta label="Placement Notes" value={hardware.placementNotes} />
            </div>
          </section>

          <section>
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
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
            <button
              type="button"
              onClick={() =>
                updateHardwareNotes(locationId, hardware.id, notes)
              }
              className="mt-2 rounded-lg border border-border-strong px-3 py-1.5 text-xs font-medium text-metallic transition hover:border-accent/40 hover:text-accent"
            >
              Save Notes
            </button>
          </section>

          <section>
            <h3 className="mb-3 text-[11px] uppercase tracking-[0.14em] text-muted">
              File Upload Zone
            </h3>
            <FileUploadZone
              files={hardware.files}
              onUpload={(files) =>
                addHardwareFiles(locationId, hardware.id, files)
              }
            />
          </section>
        </div>
      </aside>
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
    <div className="rounded-lg border border-border bg-surface-elevated/70 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p
        className={`mt-1 text-sm text-foreground ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </p>
    </div>
  );
}
