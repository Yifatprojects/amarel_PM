"use client";

import { usePathname } from "next/navigation";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { GlobalUploadModal } from "@/components/locations/GlobalUploadModal";
import { TopNav } from "@/components/shell/TopNav";
import { TreeSidebar } from "@/components/shell/TreeSidebar";
import { AppProvider, useApp } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <ShellFrame>{children}</ShellFrame>
    </AppProvider>
  );
}

function ShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showTree = pathname === "/";
  const { isMobileTreeOpen, setMobileTreeOpen } = useApp();

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 panel-grid opacity-[0.07]" />
      <TopNav />
      <div className="relative flex min-h-0 flex-1">
        {showTree && (
          <div className="hidden md:flex">
            <TreeSidebar />
          </div>
        )}
        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>

      {showTree && isMobileTreeOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            aria-label="Close theater tree"
            className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
            onClick={() => setMobileTreeOpen(false)}
          />
          <div className="animate-slide-in-left relative flex h-full w-[min(100%,20rem)] max-w-full flex-col bg-surface shadow-2xl">
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={() => setMobileTreeOpen(false)}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted shadow-sm transition hover:text-foreground"
              >
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden pt-2">
              <TreeSidebar
                className="h-full w-full border-r-0"
                onNavigate={() => setMobileTreeOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <GlobalUploadModal />
      <AIAssistant />
    </div>
  );
}
