"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";

const tabs = [
  { href: "/", label: "Locations", match: (path: string) => path === "/" },
  {
    href: "#ai",
    label: "AI Assistant",
    match: () => false,
    action: "ai" as const,
  },
  {
    href: "/insights",
    label: "Reports & Insights",
    match: (path: string) => path.startsWith("/insights"),
  },
  {
    href: "/settings",
    label: "Settings",
    match: (path: string) => path.startsWith("/settings"),
  },
];

export function TopNav() {
  const pathname = usePathname();
  const { setAiOpen, isAiOpen, setUploadOpen } = useApp();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border-strong bg-surface-elevated shadow-[inset_0_1px_0_rgba(197,208,224,0.18)]">
            <span className="font-mono text-xs font-semibold tracking-wider text-accent">
              TF
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-wide text-foreground">
              TrialFusion AI
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
              Field Trial Ops
            </p>
          </div>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            if (tab.action === "ai") {
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setAiOpen(true)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isAiOpen
                      ? "bg-accent/10 text-accent ring-1 ring-accent/25"
                      : "text-muted hover:bg-surface-elevated hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              );
            }

            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-accent/10 text-accent ring-1 ring-accent/25"
                    : "text-muted hover:bg-surface-elevated hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-background shadow-[0_0_24px_rgba(125,211,199,0.18)] transition hover:brightness-110"
        >
          <span aria-hidden className="text-base leading-none">
            +
          </span>
          Upload Files
        </button>
      </div>
    </header>
  );
}
