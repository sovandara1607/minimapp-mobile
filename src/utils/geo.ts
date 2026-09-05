import type { Coordinate } from "../types/map";
export const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
export const angleDelta = (from: number, to: number) =>
  ((((to - from + 540) % 360) + 360) % 360) - 180;
const radians = (v: number) => (v * Math.PI) / 180;
export function distance(a: Coordinate, b: Coordinate) {
  const dLat = radians(b[1] - a[1]);
  const dLon = radians(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a[1])) * Math.cos(radians(b[1])) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
}
export function bearing(a: Coordinate, b: Coordinate) {
  const dl = radians(b[0] - a[0]);
  const y = Math.sin(dl) * Math.cos(radians(b[1]));
  const x =
    Math.cos(radians(a[1])) * Math.sin(radians(b[1])) -
    Math.sin(radians(a[1])) * Math.cos(radians(b[1])) * Math.cos(dl);
  return normalizeAngle((Math.atan2(y, x) * 180) / Math.PI);
}
export function interpolateCoordinate(
  a: Coordinate,
  b: Coordinate,
  t: number,
): Coordinate {
  return [
    ((a[0] + angleDelta(a[0], b[0]) * t + 540) % 360) - 180,
    a[1] + (b[1] - a[1]) * t,
  ];
}
const EARTH_RADIUS = 6371000;
/** Great-circle destination point `meters` along `headingDeg` from `origin`. */
export function projectForward(
  origin: Coordinate,
  headingDeg: number,
  meters: number,
): Coordinate {
  if (!meters) return origin;
  const angularDistance = meters / EARTH_RADIUS;
  const bearingRad = radians(headingDeg);
  const lat1 = radians(origin[1]);
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad),
  );
  const lon2 =
    radians(origin[0]) +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );
  return [(((lon2 * 180) / Math.PI + 540) % 360) - 180, (lat2 * 180) / Math.PI];
}
