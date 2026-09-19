"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";

const tabs = [
  {
    href: "/",
    label: "Locations & Map",
    shortLabel: "Map",
    match: (path: string) => path === "/",
  },
  {
    href: "#ai",
    label: "AI Assistant",
    shortLabel: "AI",
    match: () => false,
    action: "ai" as const,
  },
  {
    href: "/insights",
    label: "Reports & Insights",
    shortLabel: "Reports",
    match: (path: string) => path.startsWith("/insights"),
  },
  {
    href: "/settings",
    label: "Settings",
    shortLabel: "Settings",
    match: (path: string) => path.startsWith("/settings"),
  },
];

export function TopNav() {
  const pathname = usePathname();
  const {
    setAiOpen,
    isAiOpen,
    setUploadOpen,
    setSelection,
    setMobileTreeOpen,
  } = useApp();
  const showTreeButton = pathname === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 lg:px-6">
        {showTreeButton && (
          <button
            type="button"
            onClick={() => setMobileTreeOpen(true)}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-metallic transition hover:border-accent/40 hover:text-accent md:hidden"
            aria-label="Open theater tree"
          >
            <MenuIcon />
          </button>
        )}

        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border-strong bg-surface-elevated shadow-[inset_0_1px_0_rgba(197,208,224,0.18)] sm:h-9 sm:w-9">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-accent sm:text-xs">
              TF
            </span>
          </div>
          <div className="hidden min-[420px]:block">
            <p className="text-sm font-semibold tracking-wide text-foreground">
              TrialFusion AI
            </p>
            <p className="hidden text-[10px] uppercase tracking-[0.16em] text-muted sm:block">
              Field Trial Ops
            </p>
          </div>
        </Link>

        <nav className="-mx-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => {
            if (tab.action === "ai") {
              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => setAiOpen(true)}
                  className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium transition sm:px-3 sm:text-sm ${
                    isAiOpen
                      ? "bg-accent/10 text-accent ring-1 ring-accent/25"
                      : "text-muted hover:bg-surface-elevated hover:text-foreground"
                  }`}
                >
                  <span className="sm:hidden">{tab.shortLabel}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            }

            const active = tab.match(pathname);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => {
                  if (tab.href === "/") setSelection({ type: "map" });
                }}
                className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-xs font-medium transition sm:px-3 sm:text-sm ${
                  active
                    ? "bg-accent/10 text-accent ring-1 ring-accent/25"
                    : "text-muted hover:bg-surface-elevated hover:text-foreground"
                }`}
              >
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-accent px-2.5 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_24px_rgba(125,211,199,0.18)] transition hover:brightness-110 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <span aria-hidden className="text-base leading-none">
            +
          </span>
          <span className="sm:hidden">Upload</span>
          <span className="hidden sm:inline">Upload Files</span>
        </button>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
