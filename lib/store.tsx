"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialLocations } from "./mock-data";
import type {
  ChatMessage,
  Hardware,
  TerrainType,
  TrialLocation,
  UploadedFile,
} from "./types";

export type NewLocationInput = {
  name: string;
  coordinates: string;
  accessCode: string;
  contactName: string;
  contactPhone: string;
  terrain: TerrainType;
  initialHardware: string;
};

type AppContextValue = {
  locations: TrialLocation[];
  chatMessages: ChatMessage[];
  isAiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  addLocation: (input: NewLocationInput) => void;
  updateHardwareNotes: (
    locationId: string,
    hardwareId: string,
    notes: string,
  ) => void;
  addHardwareFiles: (
    locationId: string,
    hardwareId: string,
    files: File[],
  ) => void;
  addLocationFiles: (locationId: string, files: File[]) => void;
  sendChatMessage: (content: string) => void;
  getLocation: (id: string) => TrialLocation | undefined;
};

const AppContext = createContext<AppContextValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildMockReply(question: string): ChatMessage {
  const lower = question.toLowerCase();
  const isSignal =
    lower.includes("signal") ||
    lower.includes("drop") ||
    lower.includes("northern") ||
    lower.includes("forest");

  if (isSignal) {
    return {
      id: uid("msg"),
      role: "assistant",
      content:
        "Based on field artifacts from Northern Forest Site 4, the signal drop on Acoustic Node 02 (18:42–18:51) most likely resulted from a transient humidity spike under the canopy. Weather Microstation WX-4 recorded a sharp moisture rise in the same window, and the technician voice note confirms condensation around the node housing. Recommend verifying seal integrity and delaying high-gain capture until humidity normalizes.",
      sources: [
        { label: "CSV Log", fileName: "acoustic_log_0916.csv" },
        { label: "Weather Trace", fileName: "wx4_humidity_trace.csv" },
        { label: "Voice Note", fileName: "node02_field_note.m4a" },
        { label: "Debrief PDF", fileName: "signal_drop_debrief.pdf" },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  return {
    id: uid("msg"),
    role: "assistant",
    content:
      "I reviewed indexed trial documents across active sites. Negev Desert Test Range hardware remains within nominal thresholds. Coastal Observation Point Kilo is on standby pending sea-state clearance. Ask about a specific site, hardware node, or uploaded log for a sourced assessment.",
    sources: [
      { label: "Seismic Baseline", fileName: "seismic_baseline_0916.csv" },
      {
        label: "Maintenance Checklist",
        fileName: "radar_maintenance_checklist.pdf",
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<TrialLocation[]>(() =>
    initialLocations.map((location) => ({
      ...location,
      files: location.files ?? [],
      hardware: location.hardware.map((item) => ({
        ...item,
        files: item.files ?? [],
      })),
    })),
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "TrialFution AI online. Ask about field documents, hardware logs, or site anomalies. Example: “What caused the signal drop at Northern Forest Site 4?”",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isAiOpen, setAiOpen] = useState(false);

  const getLocation = useCallback(
    (id: string) => locations.find((location) => location.id === id),
    [locations],
  );

  const addLocation = useCallback((input: NewLocationInput) => {
    const hardware: Hardware[] = input.initialHardware.trim()
      ? [
          {
            id: uid("hw"),
            name: input.initialHardware.trim(),
            technician: "Unassigned",
            coordinates: input.coordinates,
            placementNotes: "Pending field placement.",
            notes: "",
            status: "Operational",
            files: [],
          },
        ]
      : [];

    const location: TrialLocation = {
      id: uid("loc"),
      name: input.name.trim(),
      status: "Standby",
      coordinates: input.coordinates.trim(),
      accessCode: input.accessCode.trim(),
      contactName: input.contactName.trim(),
      contactPhone: input.contactPhone.trim(),
      terrain: input.terrain,
      hardware,
      files: [],
      lastUpdated: new Date().toISOString(),
    };

    setLocations((current) => [location, ...current]);
  }, []);

  const updateHardwareNotes = useCallback(
    (locationId: string, hardwareId: string, notes: string) => {
      setLocations((current) =>
        current.map((location) => {
          if (location.id !== locationId) return location;
          return {
            ...location,
            lastUpdated: new Date().toISOString(),
            hardware: location.hardware.map((item) =>
              item.id === hardwareId ? { ...item, notes } : item,
            ),
          };
        }),
      );
    },
    [],
  );

  const addHardwareFiles = useCallback(
    (locationId: string, hardwareId: string, files: File[]) => {
      const uploaded: UploadedFile[] = files.map((file) => ({
        id: uid("f"),
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        uploadedAt: new Date().toISOString(),
      }));

      setLocations((current) =>
        current.map((location) => {
          if (location.id !== locationId) return location;
          return {
            ...location,
            lastUpdated: new Date().toISOString(),
            hardware: location.hardware.map((item) =>
              item.id === hardwareId
                ? { ...item, files: [...uploaded, ...item.files] }
                : item,
            ),
          };
        }),
      );
    },
    [],
  );

  const addLocationFiles = useCallback((locationId: string, files: File[]) => {
    const uploaded: UploadedFile[] = files.map((file) => ({
      id: uid("f"),
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));

    setLocations((current) =>
      current.map((location) => {
        if (location.id !== locationId) return location;
        return {
          ...location,
          lastUpdated: new Date().toISOString(),
          files: [...uploaded, ...(location.files ?? [])],
        };
      }),
    );
  }, []);

  const sendChatMessage = useCallback((content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: uid("msg"),
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((current) => [...current, userMessage]);
    window.setTimeout(() => {
      setChatMessages((current) => [...current, buildMockReply(trimmed)]);
    }, 650);
  }, []);

  const value = useMemo(
    () => ({
      locations,
      chatMessages,
      isAiOpen,
      setAiOpen,
      addLocation,
      updateHardwareNotes,
      addHardwareFiles,
      addLocationFiles,
      sendChatMessage,
      getLocation,
    }),
    [
      locations,
      chatMessages,
      isAiOpen,
      addLocation,
      updateHardwareNotes,
      addHardwareFiles,
      addLocationFiles,
      sendChatMessage,
      getLocation,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
