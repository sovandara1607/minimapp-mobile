import { create } from "zustand";
import type {
  CameraTelemetry,
  LocationFix,
  LocationStatus,
  MapMode,
} from "../types/map";
interface MapState {
  mode: MapMode;
  is3D: boolean;
  mock: boolean;
  debug: boolean;
  status: LocationStatus;
  fix: LocationFix | null;
  stale: boolean;
  headingAvailable: boolean;
  camera: CameraTelemetry;
  recenterRevision: number;
  northRevision: number;
  northUp: () => void;
  setMode: (mode: MapMode) => void;
  recenter: () => void;
  toggle3D: () => void;
  setMock: (enabled: boolean) => void;
  toggleDebug: () => void;
}
export const useMapStore = create<MapState>((set, get) => ({
  mode: "follow",
  is3D: true,
  mock: false,
  debug: false,
  status: "checking",
  fix: null,
  stale: false,
  headingAvailable: true,
  camera: { bearing: 0, zoom: 16.6, pitch: 42 },
  recenterRevision: 0,
  northRevision: 0,
  northUp: () =>
    set({ mode: "explore", northRevision: get().northRevision + 1 }),
  setMode: (mode) => set({ mode }),
  recenter: () =>
    set({
      mode: get().mock ? "simulation" : "follow",
      recenterRevision: get().recenterRevision + 1,
    }),
  toggle3D: () => set({ is3D: !get().is3D }),
  setMock: (mock) => {
    if (__DEV__)
      set({
        mock,
        mode: mock ? "simulation" : "follow",
        fix: null,
        stale: false,
      });
  },
  toggleDebug: () => {
    if (__DEV__) set({ debug: !get().debug });
  },
}));
