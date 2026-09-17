"use client";

import { useMemo, useState } from "react";
import { countLocationFiles } from "@/lib/format";
import { useApp } from "@/lib/store";

export default function InsightsPage() {
  const { locations } = useApp();
  const [report, setReport] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const stats = useMemo(() => {
    const activeSites = locations.filter((l) => l.status === "Active").length;
    const hardware = locations.flatMap((l) => l.hardware);
    const operational = hardware.filter((h) => h.status === "Operational").length;
    const anomalies = hardware.filter(
      (h) => h.status === "Degraded" || h.status === "Offline",
    ).length;
    const files = locations.reduce(
      (sum, location) => sum + countLocationFiles(location),
      0,
    );

    return [
      {
        label: "Total Active Sites",
        value: String(activeSites),
        detail: `${locations.length} sites in theater`,
      },
      {
        label: "Hardware Status",
        value: `${operational}/${hardware.length}`,
        detail: "Units operational",
      },
      {
        label: "Anomalies Detected",
        value: String(anomalies),
        detail: "Degraded or offline nodes",
      },
      {
        label: "Field Artifacts",
        value: String(files),
        detail: "Uploaded documents & logs",
      },
    ];
  }, [locations]);

  function generateDebrief() {
    setGenerating(true);
    window.setTimeout(() => {
      const active = locations.filter((l) => l.status === "Active");
      const degraded = locations
        .flatMap((l) =>
          l.hardware
            .filter((h) => h.status === "Degraded" || h.status === "Offline")
            .map((h) => `${h.name} @ ${l.name} (${h.status})`),
        );

      setReport(
        [
          "AUTOMATED MULTI-SITE DEBRIEF — TrialFution AI",
          `Generated: ${new Date().toUTCString()}`,
          "",
          "1. EXECUTIVE SUMMARY",
          `Theater posture remains controlled with ${active.length} active trial site(s). Cross-site telemetry and field uploads indicate localized degradation rather than systemic failure.`,
          "",
          "2. SITE SNAPSHOT",
          ...locations.map(
            (l) =>
              `• ${l.name} [${l.status}] — ${l.hardware.length} hardware unit(s), contact ${l.contactName}.`,
          ),
          "",
          "3. ANOMALY FOCUS",
          degraded.length > 0
            ? degraded.map((line) => `• ${line}`).join("\n")
            : "• No degraded or offline hardware currently flagged.",
          "",
          "4. NORTHERN FOREST SITE 4 — SIGNAL DROP (SAMPLE)",
          "Acoustic Node 02 experienced an 18:42–18:51 dropout. Correlated humidity rise from Weather Microstation WX-4 and technician voice notes support moisture/condensation as the primary cause. Recommend seal inspection and temporary gain reduction during high-humidity windows.",
          "",
          "5. RECOMMENDED ACTIONS",
          "• Prioritize Acoustic Node 02 maintenance at Northern Forest Site 4.",
          "• Keep Coastal Observation Point Kilo on standby until sea-state clearance.",
          "• Archive Highland Ridge Echo packages and close debrief loop.",
          "",
          "— End of automated debrief —",
        ].join("\n"),
      );
      setGenerating(false);
    }, 900);
  }

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
            Insights & Reports
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
            Insights & Debrief Generator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Synthesize multi-site field evidence into structured operational
            summaries for command review.
          </p>
        </div>
        <button
          type="button"
          onClick={generateDebrief}
          disabled={generating}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
        >
          {generating ? "Generating…" : "Generate Automated Debrief"}
        </button>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-xl border border-border bg-surface p-5"
          >
            <p className="text-[11px] uppercase tracking-[0.12em] text-muted">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">
            Generated Debrief Report
          </h2>
          <p className="mt-1 text-sm text-muted">
            Sample multi-site narrative assembled from live location state and
            field artifacts.
          </p>
        </div>
        <div className="px-5 py-5">
          {report ? (
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg border border-border bg-background/70 p-4 font-mono text-xs leading-relaxed text-metallic">
              {report}
            </pre>
          ) : (
            <div className="rounded-lg border border-dashed border-border-strong px-5 py-12 text-center">
              <p className="text-sm text-muted">
                No debrief generated yet. Run{" "}
                <span className="text-accent">Generate Automated Debrief</span>{" "}
                to produce a command-ready summary.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
