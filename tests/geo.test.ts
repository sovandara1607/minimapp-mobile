import test from "node:test";
import assert from "node:assert/strict";
import { distance, distanceToPolyline } from "../src/utils/geo";
import type { Coordinate } from "../src/types/map";

// A short straight leg near San Francisco, long enough (~150m) that
// vertex-only distance would be badly wrong for a point abeam its midpoint.
const line: Coordinate[] = [
  [-122.4194, 37.7749],
  [-122.4176, 37.7749],
];

test("distanceToPolyline measures to the nearest segment, not just vertices", () => {
  const midpoint: Coordinate = [-122.4185, 37.7749];
  const onLine = distanceToPolyline(midpoint, line);
  assert.ok(onLine < 1, `expected ~0m on the line, got ${onLine}`);

  // Directly abeam the midpoint, offset north by roughly 50m.
  const offset: Coordinate = [-122.4185, 37.7749 + 50 / 111320];
  const off = distanceToPolyline(offset, line);
  assert.ok(Math.abs(off - 50) < 5, `expected ~50m off the line, got ${off}`);

  // Distance to the nearer of the two vertices would hugely overstate this —
  // confirm we're measuring against the segment, not the endpoints.
  const vertexDistance = Math.min(
    distance(offset, line[0]!),
    distance(offset, line[1]!),
  );
  assert.ok(off < vertexDistance);
});

test("distanceToPolyline clamps to an endpoint beyond the segment's ends", () => {
  const pastTheEnd: Coordinate = [-122.4160, 37.7749];
  const result = distanceToPolyline(pastTheEnd, line);
  const expected = distance(pastTheEnd, line[1]!);
  assert.ok(Math.abs(result - expected) < 1);
});

test("distanceToPolyline finds the nearest of several segments", () => {
  const multiSegment: Coordinate[] = [
    [-122.4194, 37.7749],
    [-122.4176, 37.7749],
    [-122.4176, 37.7760],
  ];
  const nearSecondLeg: Coordinate = [-122.4174, 37.7755];
  const result = distanceToPolyline(nearSecondLeg, multiSegment);
  assert.ok(result < 20, `expected a close hit on the second leg, got ${result}`);
});

test("distanceToPolyline handles a single-point line", () => {
  const point: Coordinate = [-122.4194, 37.7749];
  const single: Coordinate[] = [[-122.4184, 37.7749]];
  const result = distanceToPolyline(point, single);
  assert.ok(Math.abs(result - distance(point, single[0]!)) < 1e-6);
});
