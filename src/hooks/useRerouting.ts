import { useEffect } from "react";
import { motionEngine } from "../services/motionEngine";
import { fetchRoute } from "../services/routingService";
import { useNavigationStore } from "../stores/navigationStore";
import { distanceToPolyline } from "../utils/geo";
import type { Destination } from "../types/navigation";


const OFF_ROUTE_METERS = 40;
const OFF_ROUTE_CONFIRM_MS = 6000;
const REROUTE_COOLDOWN_MS = 8000;
const CHECK_INTERVAL_MS = 2000;


export function useRerouting() {
  useEffect(() => {
    let offSince: number | null = null;
    let lastCheckAt = 0;
    let lastRerouteAt = 0;
    let inFlight = false;
    const check = () => {
      const now = Date.now();
      if (now - lastCheckAt < CHECK_INTERVAL_MS) return;
      lastCheckAt = now;
      const state = useNavigationStore.getState();
      if (!state.navigating || !state.route || !state.destination || inFlight) {
        offSince = null;
        return;
      }
      const frame = motionEngine.getSnapshot();
      if (!frame) return;
      const deviation = distanceToPolyline(frame.coordinate, state.route.coordinates);
      if (deviation <= OFF_ROUTE_METERS) {
        offSince = null;
        return;
      }
      offSince ??= now;
      if (now - offSince < OFF_ROUTE_CONFIRM_MS) return;
      if (now - lastRerouteAt < REROUTE_COOLDOWN_MS) return;
      offSince = null;
      lastRerouteAt = now;
      inFlight = true;
      const destination: Destination = state.destination;
      const origin = frame.coordinate;
      useNavigationStore.getState().setRouteStatus("rerouting");
      fetchRoute(origin, destination.coordinate)
        .then((route) => {
          const current = useNavigationStore.getState();
          if (current.navigating && current.destination === destination) {
            current.setRoute(route);
          }
        })
        .catch(() => {
          const current = useNavigationStore.getState();
          if (current.navigating && current.destination === destination) {
            current.setRouteStatus("ready");
          }
        })
        .finally(() => {
          inFlight = false;
        });
    };
    return motionEngine.subscribe(check);
  }, []);
}
