export type LocationStatus = "Active" | "Standby" | "Debrief" | "Offline";

export type TerrainType =
  | "Desert"
  | "Forest"
  | "Urban"
  | "Coastal"
  | "Mountain"
  | "Open Field";

export type HardwareStatus =
  | "Operational"
  | "Degraded"
  | "Maintenance"
  | "Offline";

export type HardwareCategory = "Sensor" | "Logger";

export type UploadedFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
};

export type Hardware = {
  id: string;
  name: string;
  category: HardwareCategory;
  technician: string;
  coordinates: string;
  placementNotes: string;
  notes: string;
  status: HardwareStatus;
  files: UploadedFile[];
};

export type TrialLocation = {
  id: string;
  name: string;
  status: LocationStatus;
  coordinates: string;
  accessCode: string;
  contactName: string;
  contactPhone: string;
  terrain: TerrainType;
  hardware: Hardware[];
  files: UploadedFile[];
  lastUpdated: string;
};

export type Region = {
  id: string;
  name: string;
  locations: TrialLocation[];
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { label: string; fileName: string }[];
  timestamp: string;
};

export type TreeSelection =
  | { type: "region"; regionId: string }
  | { type: "location"; regionId: string; locationId: string }
  | {
      type: "hardware";
      regionId: string;
      locationId: string;
      hardwareId: string;
    };

export type UploadTarget = {
  regionId: string;
  locationId: string;
  hardwareId: string | "location";
};
