"use client";

import { DragEvent, useRef, useState } from "react";
import { fileKindLabel, formatBytes, formatTimestamp } from "@/lib/format";
import type { UploadedFile } from "@/lib/types";

type Props = {
  files: UploadedFile[];
  onUpload: (files: File[]) => void;
};

export function FileUploadZone({ files, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    onUpload(Array.from(list));
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-xl border border-dashed px-4 py-6 text-center transition ${
          dragging
            ? "border-accent bg-accent/10"
            : "border-border-strong bg-background/50"
        }`}
      >
        <p className="text-sm font-medium text-foreground">
          Drag & drop field files here
        </p>
        <p className="mt-1 text-xs text-muted">
          Documents, audio voice notes, CSV logs, and photos
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
            handleFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
          Uploaded Files
        </p>
        {files.length === 0 ? (
          <p className="rounded-lg border border-border bg-surface-elevated/50 px-3 py-3 text-sm text-muted">
            No files uploaded for this hardware unit yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => (
              <li
                key={file.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface-elevated/60 px-3 py-2.5"
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
    </div>
  );
}
