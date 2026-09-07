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

export function altitudeForZoom(zoom: number) {
  return 591657550.5 / Math.pow(2, zoom);
}

export function speedZoom(speed: number) {
  return 17.3 - Math.min(Math.max(speed, 0) / 22, 1) * 1.3;
}

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
  const pitchCompensation =
    1 / Math.max(Math.cos((pitch * Math.PI) / 180), 0.35);
  return pixelOffset * metersPerPixel * pitchCompensation;
}
