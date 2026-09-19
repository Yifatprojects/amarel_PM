"use client";

import { LocationsWorkspace } from "@/components/locations/LocationsWorkspace";
import { TreeSidebar } from "@/components/shell/TreeSidebar";

export default function LocationsPage() {
  return (
    <>
      <div className="border-b border-border md:hidden">
        <div className="max-h-72 overflow-y-auto">
          <TreeSidebar />
        </div>
      </div>
      <LocationsWorkspace />
    </>
  );
}
