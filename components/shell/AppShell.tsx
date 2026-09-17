"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { Sidebar } from "@/components/shell/Sidebar";
import { AppProvider, useApp } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ShellFrame>{children}</ShellFrame>
    </AppProvider>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const { setAiOpen } = useApp();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 panel-grid opacity-[0.07]" />

      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className="rounded-md border border-border px-2.5 py-1.5 text-xs text-metallic"
          >
            Menu
          </button>
          <p className="text-sm font-semibold tracking-wide">TrialFution AI</p>
          <button
            type="button"
            onClick={() => setAiOpen(true)}
            className="rounded-md border border-accent/30 px-2.5 py-1.5 text-xs text-accent"
          >
            AI
          </button>
        </header>
        <main key={pathname} className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileNavOpen(false)}
          />
          <div className="relative" onClick={() => setMobileNavOpen(false)}>
            <Sidebar />
          </div>
        </div>
      )}

      <AIAssistant />
    </div>
  );
}
