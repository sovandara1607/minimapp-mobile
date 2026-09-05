import type { Coordinate } from "./map";

export interface Destination {
  coordinate: Coordinate;
  label: string;
}

export interface RouteResult {
  coordinates: Coordinate[];
  distanceMeters: number;
  durationSeconds: number;
}

export type RouteStatus = "idle" | "loading" | "ready" | "error";

export interface SearchResult {
  coordinate: Coordinate;
  label: string;
}
