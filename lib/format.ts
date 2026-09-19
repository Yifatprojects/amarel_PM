import type {
  HardwareStatus,
  LocationStatus,
  MapHardwarePin,
  MapPinSeverity,
  Region,
  TrialLocation,
} from "@/lib/types";

export function countLocationFiles(location: TrialLocation) {
  const siteFiles = location.files?.length ?? 0;
  const hardwareFiles = (location.hardware ?? []).reduce(
    (sum, item) => sum + (item.files?.length ?? 0),
    0,
  );
  return siteFiles + hardwareFiles;
}

export function countRegionFiles(region: Region) {
  return region.locations.reduce(
    (sum, location) => sum + countLocationFiles(location),
    0,
  );
}

export function flattenLocations(regions: Region[]) {
  return regions.flatMap((region) =>
    region.locations.map((location) => ({ region, location })),
  );
}

export function mapPinSeverity(status: HardwareStatus): MapPinSeverity {
  switch (status) {
    case "Operational":
      return "operational";
    case "Degraded":
    case "Maintenance":
      return "warning";
    case "Offline":
      return "critical";
  }
}

export function mapPinColor(severity: MapPinSeverity) {
  switch (severity) {
    case "operational":
      return "#10b981";
    case "warning":
      return "#f59e0b";
    case "critical":
      return "#f43f5e";
  }
}

export function mapPinLabel(severity: MapPinSeverity) {
  switch (severity) {
    case "operational":
      return "Operational / Normal";
    case "warning":
      return "Warning / Pending Audit";
    case "critical":
      return "Critical Anomaly / Disconnected";
  }
}

export function collectHardwarePins(
  regions: Region[],
  regionId?: string,
): MapHardwarePin[] {
  const scoped = regionId
    ? regions.filter((region) => region.id === regionId)
    : regions;

  return scoped.flatMap((region) =>
    region.locations.flatMap((location) =>
      location.hardware.map((hardware) => ({
        regionId: region.id,
        regionName: region.name,
        locationId: location.id,
        locationName: location.name,
        hardware,
        severity: mapPinSeverity(hardware.status),
      })),
    ),
  );
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTimestamp(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function locationStatusClass(status: LocationStatus) {
  switch (status) {
    case "Active":
      return "bg-success/15 text-success ring-success/30";
    case "Standby":
      return "bg-metallic/10 text-metallic ring-metallic/25";
    case "Debrief":
      return "bg-warning/15 text-warning ring-warning/30";
    case "Offline":
      return "bg-danger/15 text-danger ring-danger/30";
  }
}

export function hardwareStatusClass(status: HardwareStatus) {
  switch (status) {
    case "Operational":
      return "bg-success/15 text-success ring-success/30";
    case "Degraded":
      return "bg-warning/15 text-warning ring-warning/30";
    case "Maintenance":
      return "bg-warning/15 text-warning ring-warning/30";
    case "Offline":
      return "bg-danger/15 text-danger ring-danger/30";
  }
}

export function fileKindLabel(type: string, name: string) {
  if (type.startsWith("image/")) return "Photo";
  if (type.startsWith("audio/")) return "Audio";
  if (type.includes("csv") || name.endsWith(".csv")) return "CSV Log";
  if (type.includes("pdf") || name.endsWith(".pdf")) return "Document";
  return "File";
}
