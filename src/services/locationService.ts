import * as Location from "expo-location";
import type { LocationFix, LocationStatus } from "../types/map";
export function permissionStatus(
  permission: Location.LocationPermissionResponse,
): LocationStatus {
  if (permission.granted) return "granted";
  if (permission.status === "undetermined") return "undetermined";
  // Expo combines OS restrictions and permanent denial in canAskAgain=false.
  return permission.canAskAgain ? "denied" : "restricted";
}
export function toLocationFix(location: Location.LocationObject): LocationFix {
  const { coords, timestamp } = location;
  return {
    coordinate: [coords.longitude, coords.latitude],
    timestamp,
    accuracy: coords.accuracy,
    speed: Math.max(0, coords.speed ?? 0),
    course:
      coords.heading !== null && coords.heading >= 0 ? coords.heading : null,
  };
}
export function watchLocation(
  onFix: (fix: LocationFix) => void,
  onError: () => void,
) {
  return Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: 0,
      timeInterval: 1000,
    },
    (location) => onFix(toLocationFix(location)),
    onError,
  );
}
