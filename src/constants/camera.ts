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
export function cameraPadding(height: number) {
  // Center of padded viewport = (height + top - bottom) / 2.
  return {
    paddingTop: height * (2 * CAMERA.playerScreenFraction - 1),
    paddingBottom: 0,
    paddingLeft: 0,
    paddingRight: 0,
  };
}
export function speedZoom(speed: number) {
  return 17.3 - Math.min(Math.max(speed, 0) / 22, 1) * 1.3;
}
