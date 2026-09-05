import {
  angleDelta,
  distance,
  interpolateCoordinate,
  normalizeAngle,
} from "../utils/geo";
import type { LocationFix, MotionFrame } from "../types/map";

/** Pure smoothing engine. A low-rate scheduler feeds native map animations, never a React frame loop. */
export class MotionEngine {
  private fix: LocationFix | null = null;
  private frame: MotionFrame | null = null;
  private compass: { heading: number; timestamp: number } | null = null;
  private coursePreferred = false;
  private previousTick = 0;
  private reversal: number | null = null;
  private reversalCount = 0;
  private listeners = new Set<() => void>();
  getSnapshot = () => this.frame;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  reset() {
    this.fix = null;
    this.frame = null;
    this.compass = null;
    this.coursePreferred = false;
    this.previousTick = 0;
    this.reversal = null;
    this.reversalCount = 0;
    this.emit();
  }
  setHeading(heading: number, timestamp = Date.now()) {
    if (!Number.isFinite(heading) || heading < 0) return;
    // Require repeated evidence for a reversal; isolated compass spikes are discarded.
    if (
      this.compass &&
      Math.abs(angleDelta(this.compass.heading, heading)) > 120
    ) {
      this.reversalCount =
        this.reversal !== null &&
        Math.abs(angleDelta(this.reversal, heading)) < 25
          ? this.reversalCount + 1
          : 1;
      this.reversal = heading;
      if (this.reversalCount < 3) return;
    }
    this.reversal = null;
    this.reversalCount = 0;
    this.compass = { heading: normalizeAngle(heading), timestamp };
  }
  setFix(fix: LocationFix) {
    const [lon, lat] = fix.coordinate;
    if (
      ![lon, lat, fix.timestamp, fix.speed].every(Number.isFinite) ||
      Math.abs(lon) > 180 ||
      Math.abs(lat) > 90
    )
      return false;
    if (
      fix.accuracy !== null &&
      (!Number.isFinite(fix.accuracy) || fix.accuracy < 0 || fix.accuracy > 80)
    )
      return false;
    if (this.fix) {
      const seconds = (fix.timestamp - this.fix.timestamp) / 1000;
      if (seconds <= 0) return false;
      const allowance = Math.max(
        60,
        Math.max(fix.speed, this.fix.speed) * seconds * 3 +
          (fix.accuracy ?? 20),
      );
      if (
        seconds < 30 &&
        distance(this.fix.coordinate, fix.coordinate) > allowance
      )
        return false;
    }
    this.fix = {
      ...fix,
      speed: Math.max(0, fix.speed),
      course:
        fix.course !== null && Number.isFinite(fix.course) && fix.course >= 0
          ? normalizeAngle(fix.course)
          : null,
    };
    return true;
  }
  tick(now: number) {
    if (!this.fix) return;
    const dt = this.previousTick
      ? Math.min((now - this.previousTick) / 1000, 0.5)
      : 0.2;
    this.previousTick = now;
    this.coursePreferred = this.fix.speed > (this.coursePreferred ? 2.2 : 3.5);
    const reliableCourse =
      this.coursePreferred &&
      this.fix.course !== null &&
      this.fix.accuracy !== null &&
      this.fix.accuracy <= 30 &&
      now - this.fix.timestamp < 5000;
    const targetHeading = reliableCourse
      ? this.fix.course!
      : this.compass && now - this.compass.timestamp < 5000
        ? this.compass.heading
        : (this.frame?.heading ?? this.fix.course ?? 0);
    if (!this.frame) {
      this.frame = {
        coordinate: this.fix.coordinate,
        heading: targetHeading,
        speed: this.fix.speed,
      };
    } else {
      const delta = angleDelta(this.frame.heading, targetHeading);
      const turn = Math.max(
        -90 * dt,
        Math.min(90 * dt, delta * (1 - Math.exp(-dt / 0.35))),
      );
      this.frame = {
        coordinate: interpolateCoordinate(
          this.frame.coordinate,
          this.fix.coordinate,
          1 - Math.exp(-dt / 0.45),
        ),
        heading: normalizeAngle(this.frame.heading + turn),
        speed:
          this.frame.speed +
          (this.fix.speed - this.frame.speed) * (1 - Math.exp(-dt / 1.2)),
      };
    }
    this.emit();
  }
  private emit() {
    this.listeners.forEach((listener) => listener());
  }
}
export const motionEngine = new MotionEngine();
