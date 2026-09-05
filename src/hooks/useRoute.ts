import { useEffect } from "react";
import { motionEngine } from "../services/motionEngine";
import { fetchRoute } from "../services/routingService";
import { useNavigationStore } from "../stores/navigationStore";

/**
 * Fetches a route whenever a destination is set, from wherever the player
 * currently is. The origin is read once, at the moment the destination is
 * set — not re-fetched as the player moves — which is enough for previewing
 * and starting a route; live re-routing on drift is a later-milestone concern.
 */
export function useRoute() {
  const destination = useNavigationStore((s) => s.destination);
  useEffect(() => {
    if (!destination) return;
    let cancelled = false;
    const origin = motionEngine.getSnapshot()?.coordinate;
    if (!origin) {
      useNavigationStore.getState().setRouteStatus("error");
      return;
    }
    fetchRoute(origin, destination.coordinate)
      .then((route) => {
        if (!cancelled) useNavigationStore.getState().setRoute(route);
      })
      .catch(() => {
        if (!cancelled) useNavigationStore.getState().setRouteStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [destination]);
}
