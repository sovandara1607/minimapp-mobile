import { useEffect } from "react";
import { motionEngine } from "../services/motionEngine";
import { fetchRoute } from "../services/routingService";
import { useNavigationStore } from "../stores/navigationStore";
import { distanceToPolyline } from "../utils/geo";
import type { Destination } from "../types/navigation";

// How far off the route line counts as having left it, how long that has to
// hold before it's a real deviation (not one noisy GPS fix), and the minimum
// gap between reroute attempts so a borderline drift can't hammer the routing
// API on every position update.
const OFF_ROUTE_METERS = 40;
const OFF_ROUTE_CONFIRM_MS = 6000;
const REROUTE_COOLDOWN_MS = 8000;
// Distance-to-polyline is O(route points); checking every motion frame
// (5 Hz) is unnecessary when nothing but GPS noise changes that often.
const CHECK_INTERVAL_MS = 2000;

/**
 * Watches live position against the active route while navigating, and
 * silently re-fetches a route from wherever the player actually is once
 * they've strayed from the line for long enough — the "took a wrong turn"
 * recovery `useRoute` deliberately leaves for this hook. A route that's only
 * being previewed (destination set, `navigating` still false) is left alone.
 */
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
      // Still on screen throughout: the stale route stays visible under the
      // "Rerouting…" status rather than disappearing while the new one loads.
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
          // Keep the stale route rather than clearing it — still roughly the
          // right direction, and the next drift check tries again.
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
