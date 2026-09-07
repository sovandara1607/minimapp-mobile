import { useEffect } from "react";
import { motionEngine } from "../services/motionEngine";
import { fetchRoute } from "../services/routingService";
import { useNavigationStore } from "../stores/navigationStore";


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
