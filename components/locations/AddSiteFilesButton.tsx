"use client";

import { useRef } from "react";
import { useApp } from "@/lib/store";

type Props = {
  locationId: string;
  className?: string;
  label?: string;
};

export function AddSiteFilesButton({
  locationId,
  className,
  label = "Add Files",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { addLocationFiles } = useApp();

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          inputRef.current?.click();
        }}
        className={
          className ??
          "inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface-elevated px-2.5 py-1.5 text-xs font-medium text-metallic transition hover:border-accent/40 hover:text-accent"
        }
      >
        <span aria-hidden>+</span>
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.csv,.txt,.doc,.docx,image/*,audio/*"
        className="hidden"
        onChange={(event) => {
          const files = event.target.files;
          if (files && files.length > 0) {
            addLocationFiles(locationId, Array.from(files));
          }
          event.target.value = "";
        }}
        onClick={(event) => event.stopPropagation()}
      />
    </>
  );
}
