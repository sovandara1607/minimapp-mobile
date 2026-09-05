import { create } from "zustand";
import type { RouteResult, RouteStatus, Destination } from "../types/navigation";

interface NavigationState {
  destination: Destination | null;
  route: RouteResult | null;
  routeStatus: RouteStatus;
  navigating: boolean;
  setDestination: (destination: Destination) => void;
  clearDestination: () => void;
  setRoute: (route: RouteResult) => void;
  setRouteStatus: (status: RouteStatus) => void;
  startNavigating: () => void;
  stopNavigating: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  destination: null,
  route: null,
  routeStatus: "idle",
  navigating: false,
  setDestination: (destination) =>
    set({ destination, route: null, routeStatus: "loading", navigating: false }),
  clearDestination: () =>
    set({ destination: null, route: null, routeStatus: "idle", navigating: false }),
  setRoute: (route) => set({ route, routeStatus: "ready" }),
  setRouteStatus: (routeStatus) => set({ routeStatus }),
  startNavigating: () => set({ navigating: true }),
  stopNavigating: () => set({ navigating: false }),
}));
