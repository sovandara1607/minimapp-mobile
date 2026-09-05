export type Coordinate = [longitude: number, latitude: number];
export type MapMode = "follow" | "explore" | "simulation";
export type LocationStatus =
  | "checking"
  | "undetermined"
  | "granted"
  | "denied"
  | "restricted"
  | "unavailable";
export interface LocationFix {
  coordinate: Coordinate;
  timestamp: number;
  accuracy: number | null;
  speed: number;
  course: number | null;
}
export interface MotionFrame {
  coordinate: Coordinate;
  heading: number;
  speed: number;
}
export interface CameraTelemetry {
  bearing: number;
  zoom: number;
  pitch: number;
}
