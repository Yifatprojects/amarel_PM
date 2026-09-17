export type LocationStatus = "Active" | "Standby" | "Debrief" | "Offline";

export type TerrainType =
  | "Desert"
  | "Forest"
  | "Urban"
  | "Coastal"
  | "Mountain"
  | "Open Field";

export type HardwareStatus = "Operational" | "Degraded" | "Maintenance" | "Offline";

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

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { label: string; fileName: string }[];
  timestamp: string;
};

export type AppView = "locations" | "insights" | "settings";
