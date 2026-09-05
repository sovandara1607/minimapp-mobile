export const CAMERA = {
  followZoom: 16.6,
  followPitch: 42,
  simulationPitch: 50,
  minZoom: 3,
  maxZoom: 19,
  transitionMs: 1100,
  frameMs: 200,
  playerScreenFraction: 0.68,
} as const;

/**
 * react-native-maps' Camera.zoom only applies on Google Maps; iOS MapKit uses
 * `altitude` (meters) instead, with no first-party conversion between the two.
 * This is the community-standard approximation (ignores latitude, unlike true
 * Web Mercator ground resolution) — close enough to start from, tune on device.
 */
export function altitudeForZoom(zoom: number) {
  return 591657550.5 / Math.pow(2, zoom);
}

export function speedZoom(speed: number) {
  return 17.3 - Math.min(Math.max(speed, 0) / 22, 1) * 1.3;
}

/**
 * react-native-maps has no camera "padding" for a live-following camera (only
 * for one-shot `fitToCoordinates`). To keep the player at `fraction` down the
 * screen we instead aim the camera at a point ahead of the player and let the
 * real position fall behind it in frame — same visual result, achieved by
 * moving the target instead of the viewport.
 */
export function forwardOffsetMeters(
  heightPx: number,
  zoom: number,
  pitch: number,
  latitude: number,
  fraction: number = CAMERA.playerScreenFraction,
) {
  const metersPerPixel =
    (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / Math.pow(2, zoom);
  const pixelOffset = heightPx * (fraction - 0.5);
  // Each vertical screen pixel covers more ground as pitch increases toward
  // the horizon; this keeps the puck near `fraction` across pitch changes
  // instead of drifting up screen as the camera tilts. Approximate.
  const pitchCompensation =
    1 / Math.max(Math.cos((pitch * Math.PI) / 180), 0.35);
  return pixelOffset * metersPerPixel * pitchCompensation;
}
