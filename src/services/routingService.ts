import type { Coordinate } from "../types/map";
import type { RouteResult } from "../types/navigation";

// OSRM's public demo server: free, no account or API key. It has no uptime
// or rate-limit guarantee, so swap OSRM_BASE_URL for a self-hosted or paid
// OSRM/Valhalla/GraphHopper instance before shipping this to real users.
const OSRM_BASE_URL = "https://router.project-osrm.org";

export async function fetchRoute(
  origin: Coordinate,
  destination: Coordinate,
): Promise<RouteResult> {
  const path = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
  const url = `${OSRM_BASE_URL}/route/v1/driving/${path}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Routing request failed (${response.status})`);
  const body = await response.json();
  if (body.code !== "Ok" || !body.routes?.[0]) {
    throw new Error("No route found between those points");
  }
  const route = body.routes[0];
  return {
    coordinates: route.geometry.coordinates as Coordinate[],
    distanceMeters: route.distance as number,
    durationSeconds: route.duration as number,
  };
}
