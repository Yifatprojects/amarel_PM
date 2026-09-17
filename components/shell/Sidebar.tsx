"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";

const navItems = [
  { href: "/", label: "Locations", icon: MapIcon },
  { href: "/insights", label: "Insights", icon: ChartIcon },
  { href: "/settings", label: "Settings", icon: GearIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { setAiOpen, isAiOpen } = useApp();

  return (
    <aside className="animate-slide-in-left flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border-strong bg-surface-elevated shadow-[inset_0_1px_0_rgba(197,208,224,0.18)]">
            <span className="font-mono text-xs font-semibold tracking-wider text-accent">
              TF
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-foreground">
              TrialFution AI
            </p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">
              Field Trial Ops
            </p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/" || pathname.startsWith("/locations")
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-accent/10 text-accent ring-1 ring-accent/25"
                  : "text-muted hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className={`mt-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
            isAiOpen
              ? "bg-accent/10 text-accent ring-1 ring-accent/25"
              : "text-muted hover:bg-surface-elevated hover:text-foreground"
          }`}
        >
          <SparkIcon className="h-4 w-4" />
          AI Agent
        </button>
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-border bg-surface-elevated p-3">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
            Secure Session
          </p>
          <p className="mt-1 text-sm text-foreground">Ops Console · Clearance B</p>
        </div>
      </div>
    </aside>
  );
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 4.5 3.5 7v12.5L9 17l6 2.5L20.5 17V4.5L15 7 9 4.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 4.5V17M15 7v12.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 19.5h16M7 16V10M12 16V6M17 16v-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M19.4 13.1v-2.2l-1.7-.9.3-1.8-1.9-1.4-1.5 1.1-1.9-.3L12 5.5l-1.7 1.1-1.9.3-1.5-1.1-1.9 1.4.3 1.8-1.7.9v2.2l1.7.9-.3 1.8 1.9 1.4 1.5-1.1 1.9.3L12 18.5l1.7-1.1 1.9-.3 1.5 1.1 1.9-1.4-.3-1.8 1.7-.9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SparkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3.5 13.8 9l5.7 1.2-4.4 3.7 1.3 5.6L12 16.8 7.6 19.5l1.3-5.6-4.4-3.7L10.2 9 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
