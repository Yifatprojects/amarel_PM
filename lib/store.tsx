"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { initialRegions } from "./mock-data";
import type {
  ChatMessage,
  Hardware,
  HardwareCategory,
  HardwareStatus,
  Region,
  TerrainType,
  TreeSelection,
  TrialLocation,
  UploadTarget,
  UploadedFile,
} from "./types";

export type NewLocationInput = {
  regionId: string;
  name: string;
  coordinates: string;
  accessCode: string;
  contactName: string;
  contactPhone: string;
  terrain: TerrainType;
  initialHardware: string;
  hardwareCategory: HardwareCategory;
};

type AppContextValue = {
  regions: Region[];
  selection: TreeSelection;
  setSelection: (selection: TreeSelection) => void;
  chatMessages: ChatMessage[];
  isAiOpen: boolean;
  setAiOpen: (open: boolean) => void;
  isUploadOpen: boolean;
  setUploadOpen: (open: boolean) => void;
  isMobileTreeOpen: boolean;
  setMobileTreeOpen: (open: boolean) => void;
  addLocation: (input: NewLocationInput) => void;
  updateHardwareNotes: (
    locationId: string,
    hardwareId: string,
    notes: string,
  ) => void;
  updateHardwareStatus: (
    locationId: string,
    hardwareId: string,
    status: HardwareStatus,
  ) => void;
  uploadFiles: (target: UploadTarget, files: File[]) => void;
  sendChatMessage: (content: string) => void;
  getRegion: (id: string) => Region | undefined;
  getLocation: (
    locationId: string,
  ) => { region: Region; location: TrialLocation } | undefined;
  getHardware: (
    locationId: string,
    hardwareId: string,
  ) =>
    | { region: Region; location: TrialLocation; hardware: Hardware }
    | undefined;
};

const AppContext = createContext<AppContextValue | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function toUploaded(files: File[]): UploadedFile[] {
  return files.map((file) => ({
    id: uid("f"),
    name: file.name,
    type: file.type || "application/octet-stream",
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }));
}

function normalizeRegions(regions: Region[]): Region[] {
  return regions.map((region) => ({
    ...region,
    locations: region.locations.map((location) => ({
      ...location,
      files: location.files ?? [],
      hardware: location.hardware.map((item) => ({
        ...item,
        files: item.files ?? [],
        category: item.category ?? "Sensor",
      })),
    })),
  }));
}

function buildMockReply(question: string): ChatMessage {
  const lower = question.toLowerCase();
  const isSignal =
    lower.includes("signal") ||
    lower.includes("drop") ||
    lower.includes("galilee") ||
    lower.includes("northern") ||
    lower.includes("acoustic");

  if (isSignal) {
    return {
      id: uid("msg"),
      role: "assistant",
      content:
        "Based on field artifacts from Galilee Range Alpha (Northern Israel), the signal drop on Acoustic Node B (18:42–18:51) most likely resulted from a transient humidity spike under the canopy. Weather Microstation WX-4 recorded a sharp moisture rise in the same window, and the technician voice note confirms condensation around the node housing. Recommend verifying seal integrity and delaying high-gain capture until humidity normalizes.",
      sources: [
        { label: "CSV Log", fileName: "acoustic_log_0916.csv" },
        { label: "Weather Trace", fileName: "wx4_humidity_trace.csv" },
        { label: "Voice Note", fileName: "node02_field_note.m4a" },
        { label: "Site Brief", fileName: "galilee_site_brief.pdf" },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  return {
    id: uid("msg"),
    role: "assistant",
    content:
      "I reviewed indexed trial documents across Northern Israel, Southern Israel, and California. Negev Desert Range hardware remains within nominal thresholds. Ramon Crater Site 1 is on standby. Ask about a specific region, location, or hardware node for a sourced assessment.",
    sources: [
      { label: "Seismic Baseline", fileName: "seismic_baseline_0916.csv" },
      { label: "Mojave Closeout", fileName: "mojave_closeout_notes.pdf" },
    ],
    timestamp: new Date().toISOString(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [regions, setRegions] = useState<Region[]>(() =>
    normalizeRegions(initialRegions),
  );
  const [selection, setSelection] = useState<TreeSelection>({
    type: "map",
  });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "TrialFusion AI online. Ask about field documents, hardware logs, or site anomalies. Example: “What caused the signal drop at Galilee Range Alpha?”",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isAiOpen, setAiOpen] = useState(false);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isMobileTreeOpen, setMobileTreeOpen] = useState(false);

  const getRegion = useCallback(
    (id: string) => regions.find((region) => region.id === id),
    [regions],
  );

  const getLocation = useCallback(
    (locationId: string) => {
      for (const region of regions) {
        const location = region.locations.find((item) => item.id === locationId);
        if (location) return { region, location };
      }
      return undefined;
    },
    [regions],
  );

  const getHardware = useCallback(
    (locationId: string, hardwareId: string) => {
      const found = getLocation(locationId);
      if (!found) return undefined;
      const hardware = found.location.hardware.find(
        (item) => item.id === hardwareId,
      );
      if (!hardware) return undefined;
      return { ...found, hardware };
    },
    [getLocation],
  );

  const addLocation = useCallback((input: NewLocationInput) => {
    const hardware: Hardware[] = input.initialHardware.trim()
      ? [
          {
            id: uid("hw"),
            name: input.initialHardware.trim(),
            category: input.hardwareCategory,
            technician: "Unassigned",
            coordinates: input.coordinates,
            lat: 32.0,
            lng: 35.0,
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
      lat: 32.0,
      lng: 35.0,
      accessCode: input.accessCode.trim(),
      contactName: input.contactName.trim(),
      contactPhone: input.contactPhone.trim(),
      terrain: input.terrain,
      hardware,
      files: [],
      lastUpdated: new Date().toISOString(),
    };

    setRegions((current) =>
      current.map((region) =>
        region.id === input.regionId
          ? { ...region, locations: [location, ...region.locations] }
          : region,
      ),
    );
    setSelection({
      type: "location",
      regionId: input.regionId,
      locationId: location.id,
    });
  }, []);

  const updateHardwareNotes = useCallback(
    (locationId: string, hardwareId: string, notes: string) => {
      setRegions((current) =>
        current.map((region) => ({
          ...region,
          locations: region.locations.map((location) => {
            if (location.id !== locationId) return location;
            return {
              ...location,
              lastUpdated: new Date().toISOString(),
              hardware: location.hardware.map((item) =>
                item.id === hardwareId ? { ...item, notes } : item,
              ),
            };
          }),
        })),
      );
    },
    [],
  );

  const updateHardwareStatus = useCallback(
    (locationId: string, hardwareId: string, status: HardwareStatus) => {
      setRegions((current) =>
        current.map((region) => ({
          ...region,
          locations: region.locations.map((location) => {
            if (location.id !== locationId) return location;
            return {
              ...location,
              lastUpdated: new Date().toISOString(),
              hardware: location.hardware.map((item) =>
                item.id === hardwareId ? { ...item, status } : item,
              ),
            };
          }),
        })),
      );
    },
    [],
  );

  const uploadFiles = useCallback((target: UploadTarget, files: File[]) => {
    if (!files.length) return;
    const uploaded = toUploaded(files);

    setRegions((current) =>
      current.map((region) => {
        if (region.id !== target.regionId) return region;
        return {
          ...region,
          locations: region.locations.map((location) => {
            if (location.id !== target.locationId) return location;
            if (target.hardwareId === "location") {
              return {
                ...location,
                lastUpdated: new Date().toISOString(),
                files: [...uploaded, ...(location.files ?? [])],
              };
            }
            return {
              ...location,
              lastUpdated: new Date().toISOString(),
              hardware: location.hardware.map((item) =>
                item.id === target.hardwareId
                  ? { ...item, files: [...uploaded, ...(item.files ?? [])] }
                  : item,
              ),
            };
          }),
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
      regions,
      selection,
      setSelection,
      chatMessages,
      isAiOpen,
      setAiOpen,
      isUploadOpen,
      setUploadOpen,
      isMobileTreeOpen,
      setMobileTreeOpen,
      addLocation,
      updateHardwareNotes,
      updateHardwareStatus,
      uploadFiles,
      sendChatMessage,
      getRegion,
      getLocation,
      getHardware,
    }),
    [
      regions,
      selection,
      chatMessages,
      isAiOpen,
      isUploadOpen,
      isMobileTreeOpen,
      addLocation,
      updateHardwareNotes,
      updateHardwareStatus,
      uploadFiles,
      sendChatMessage,
      getRegion,
      getLocation,
      getHardware,
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
