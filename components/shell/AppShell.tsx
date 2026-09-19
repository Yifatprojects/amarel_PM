"use client";

import { usePathname } from "next/navigation";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { GlobalUploadModal } from "@/components/locations/GlobalUploadModal";
import { TopNav } from "@/components/shell/TopNav";
import { TreeSidebar } from "@/components/shell/TreeSidebar";
import { AppProvider } from "@/lib/store";

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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="pointer-events-none fixed inset-0 panel-grid opacity-[0.07]" />
      <TopNav />
      <div className="relative flex min-h-0 flex-1">
        {showTree && (
          <div className="hidden md:flex">
            <TreeSidebar />
          </div>
        )}
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
      <GlobalUploadModal />
      <AIAssistant />
    </div>
  );
}
