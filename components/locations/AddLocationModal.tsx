"use client";

import { FormEvent, useState } from "react";
import { useApp, type NewLocationInput } from "@/lib/store";
import type { TerrainType } from "@/lib/types";

const terrainOptions: TerrainType[] = [
  "Desert",
  "Forest",
  "Urban",
  "Coastal",
  "Mountain",
  "Open Field",
];

const emptyForm: NewLocationInput = {
  name: "",
  coordinates: "",
  accessCode: "",
  contactName: "",
  contactPhone: "",
  terrain: "Desert",
  initialHardware: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
};

export function AddLocationModal({ open, onClose }: Props) {
  const { addLocation } = useApp();
  const [form, setForm] = useState<NewLocationInput>(emptyForm);

  if (!open) return null;

  function update<K extends keyof NewLocationInput>(
    key: K,
    value: NewLocationInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.coordinates.trim()) return;
    addLocation(form);
    setForm(emptyForm);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal overlay"
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-location-title"
        className="animate-fade-in relative w-full max-w-xl rounded-xl border border-border bg-surface shadow-2xl"
      >
        <div className="border-b border-border px-6 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
            Trial Sites
          </p>
          <h2
            id="add-location-title"
            className="text-lg font-semibold text-foreground"
          >
            Add New Location
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <Field label="Location Name" htmlFor="loc-name">
            <input
              id="loc-name"
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputClass}
              placeholder="e.g. Negev Desert Test Range"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Coordinates" htmlFor="loc-coords">
              <input
                id="loc-coords"
                required
                value={form.coordinates}
                onChange={(e) => update("coordinates", e.target.value)}
                className={inputClass}
                placeholder="31.0000° N, 35.0000° E"
              />
            </Field>
            <Field label="Access Code" htmlFor="loc-access">
              <input
                id="loc-access"
                value={form.accessCode}
                onChange={(e) => update("accessCode", e.target.value)}
                className={inputClass}
                placeholder="SITE-CODE-01"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Key Contact Person" htmlFor="loc-contact">
              <input
                id="loc-contact"
                value={form.contactName}
                onChange={(e) => update("contactName", e.target.value)}
                className={inputClass}
                placeholder="Capt. Name"
              />
            </Field>
            <Field label="Contact Phone" htmlFor="loc-phone">
              <input
                id="loc-phone"
                value={form.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
                className={inputClass}
                placeholder="+972-50-000-0000"
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Terrain Type" htmlFor="loc-terrain">
              <select
                id="loc-terrain"
                value={form.terrain}
                onChange={(e) =>
                  update("terrain", e.target.value as TerrainType)
                }
                className={inputClass}
              >
                {terrainOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Initial Hardware Assigned" htmlFor="loc-hw">
              <input
                id="loc-hw"
                value={form.initialHardware}
                onChange={(e) => update("initialHardware", e.target.value)}
                className={inputClass}
                placeholder="e.g. Acoustic Node 01"
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition hover:border-border-strong hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background transition hover:brightness-110"
            >
              Create Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-medium uppercase tracking-[0.08em] text-muted"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-accent/50 focus:ring-1 focus:ring-accent/30";
