import test from "node:test";
import assert from "node:assert/strict";
import { MotionEngine } from "../src/services/motionEngine";
import {
  angleDelta,
  distance,
  interpolateCoordinate,
  projectForward,
} from "../src/utils/geo";
import { mockFixAt } from "../src/services/mockLocationService";
import { forwardOffsetMeters, speedZoom } from "../src/constants/camera";
import type { Coordinate, LocationFix } from "../src/types/map";
const base: LocationFix = {
  coordinate: [-122.39484, 37.78135],
  accuracy: 5,
  speed: 0,
  course: null,
  timestamp: 1000,
};
const frame = (engine: MotionEngine) => {
  const value = engine.getSnapshot();
  assert.ok(value);
  return value;
};

test("heading crosses north using the short arc in both directions", () => {
  for (const [from, to] of [
    [359, 1],
    [1, 359],
  ]) {
    const engine = new MotionEngine();
    engine.setFix(base);
    engine.setHeading(from!, 1000);
    engine.tick(1000);
    engine.setHeading(to!, 1200);
    engine.tick(1200);
    assert.ok(Math.abs(angleDelta(from!, frame(engine).heading)) < 2);
    assert.ok(Math.abs(angleDelta(to!, frame(engine).heading)) < 2);
  }
});

test("one compass reversal is ignored, sustained reversal is rate limited", () => {
  const engine = new MotionEngine();
  engine.setFix(base);
  engine.setHeading(0, 1000);
  engine.tick(1000);
  engine.setHeading(180, 1200);
  engine.tick(1200);
  assert.equal(frame(engine).heading, 0);
  engine.setHeading(179, 1400);
  engine.setHeading(181, 1600);
  engine.tick(1400);
  assert.ok(Math.abs(angleDelta(0, frame(engine).heading)) <= 18.001);
  assert.ok(Math.abs(angleDelta(0, frame(engine).heading)) > 0);
});

test("GPS positions are interpolated rather than teleported", () => {
  const engine = new MotionEngine();
  engine.setFix(base);
  engine.tick(1000);
  const target: LocationFix = {
    ...base,
    coordinate: [-122.39474, 37.78135],
    timestamp: 2000,
  };
  assert.equal(engine.setFix(target), true);
  engine.tick(1200);
  const initialDistance = distance(base.coordinate, target.coordinate);
  assert.ok(distance(base.coordinate, frame(engine).coordinate) > 0);
  assert.ok(
    distance(base.coordinate, frame(engine).coordinate) < initialDistance,
  );
  for (let now = 1400; now < 6000; now += 200) engine.tick(now);
  assert.ok(distance(frame(engine).coordinate, target.coordinate) < 0.1);
});

test("poor accuracy, invalid and out-of-order fixes cannot shake the camera", () => {
  const engine = new MotionEngine();
  assert.equal(engine.setFix(base), true);
  assert.equal(engine.setFix({ ...base, timestamp: 999 }), false);
  assert.equal(
    engine.setFix({ ...base, timestamp: 2000, accuracy: 150 }),
    false,
  );
  assert.equal(
    engine.setFix({ ...base, timestamp: 2000, coordinate: [NaN, 37] }),
    false,
  );
  assert.equal(
    engine.setFix({ ...base, timestamp: 2000, coordinate: [-120, 37] }),
    false,
  );
  assert.equal(
    engine.setFix({ ...base, timestamp: 40000, coordinate: [-120, 37] }),
    true,
  );
});

test("walking prefers compass; reliable driving prefers course", () => {
  const engine = new MotionEngine();
  engine.setHeading(0, 1000);
  engine.setFix({ ...base, speed: 1, course: 90 });
  engine.tick(1000);
  assert.equal(frame(engine).heading, 0);
  engine.setFix({ ...base, timestamp: 2000, speed: 10, course: 90 });
  for (let now = 2000; now <= 4000; now += 200) engine.tick(now);
  assert.ok(frame(engine).heading > 85);
});

test("unreliable course and expired compass hold last direction", () => {
  const engine = new MotionEngine();
  engine.setFix(base);
  engine.setHeading(30, 1000);
  engine.tick(1000);
  engine.setFix({
    ...base,
    timestamp: 7000,
    speed: 10,
    course: 180,
    accuracy: 50,
  });
  engine.tick(7000);
  assert.equal(frame(engine).heading, 30);
});

test("reset prevents interpolation across live and mock sources", () => {
  const engine = new MotionEngine();
  engine.setFix(base);
  engine.tick(1000);
  engine.reset();
  assert.equal(engine.getSnapshot(), null);
  engine.setFix({ ...base, coordinate: [104.92, 11.56] });
  engine.tick(1000);
  assert.deepEqual(frame(engine).coordinate, [104.92, 11.56]);
});

test("simulation remains continuous across turns and loop boundaries", () => {
  let previous = mockFixAt(0, 0);
  for (let t = 0.5; t < 500; t += 0.5) {
    const next = mockFixAt(t, t * 1000);
    assert.ok(distance(previous.coordinate, next.coordinate) < 4.1);
    assert.ok(next.course !== null && next.course >= 0 && next.course < 360);
    previous = next;
  }
});

test("coordinate interpolation takes the short path over the date line", () => {
  const halfway = interpolateCoordinate([179.9, 0], [-179.9, 0], 0.5);
  assert.ok(Math.abs(Math.abs(halfway[0]) - 180) < 1e-8);
});

test("forward offset is zero when centered and grows with screen height", () => {
  for (const height of [320, 500, 800]) {
    assert.equal(forwardOffsetMeters(height, 16, 42, 37.78, 0.5), 0);
  }
  const small = forwardOffsetMeters(320, 16, 42, 37.78, 0.68);
  const large = forwardOffsetMeters(800, 16, 42, 37.78, 0.68);
  assert.ok(small > 0 && large > small);
  assert.equal(speedZoom(0), 17.3);
  assert.equal(speedZoom(100), 16);
});

test("projecting forward moves the expected distance and direction", () => {
  const origin: Coordinate = [-122.39484, 37.78135];
  const north = projectForward(origin, 0, 100);
  assert.ok(north[1] > origin[1]);
  assert.ok(Math.abs(north[0] - origin[0]) < 1e-6);
  assert.ok(Math.abs(distance(origin, north) - 100) < 1);
  assert.deepEqual(projectForward(origin, 90, 0), origin);
});
