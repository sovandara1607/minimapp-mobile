import { MOCK_ROUTE } from "../constants/mockRoute";
import { bearing, distance, interpolateCoordinate } from "../utils/geo";
import type { LocationFix } from "../types/map";
const segments = MOCK_ROUTE.slice(1).map((end, i) => ({
  start: MOCK_ROUTE[i]!,
  end,
  length: distance(MOCK_ROUTE[i]!, end),
}));
const total = segments.reduce((sum, s) => sum + s.length, 0);
export function mockFixAt(
  elapsedSeconds: number,
  timestamp: number,
): LocationFix {
  let remaining = (((elapsedSeconds * 8) % total) + total) % total;
  let segment = segments[0]!;
  for (const candidate of segments) {
    segment = candidate;
    if (remaining < candidate.length) break;
    remaining -= candidate.length;
  }
  return {
    coordinate: interpolateCoordinate(
      segment.start,
      segment.end,
      remaining / segment.length,
    ),
    timestamp,
    accuracy: 4,
    speed: 8,
    course: bearing(segment.start, segment.end),
  };
}
export function startMockLocation(onFix: (fix: LocationFix) => void) {
  const start = Date.now();
  const update = () => {
    const now = Date.now();
    onFix(mockFixAt((now - start) / 1000, now));
  };
  update();
  const timer = setInterval(update, 1000);
  return () => clearInterval(timer);
}
