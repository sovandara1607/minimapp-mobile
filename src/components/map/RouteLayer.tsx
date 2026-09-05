import { memo } from "react";
import { Polyline } from "react-native-maps";
import { colors } from "../../constants/theme";
import type { Coordinate } from "../../types/map";

/**
 * A strong two-layer line — a dark casing under a bright inner stroke —
 * stays legible over both the muted roads and the extruded 3D buildings.
 * Route progress (dimming the completed portion) is a later milestone.
 */
export const RouteLayer = memo(function RouteLayer({
  coordinates,
}: {
  coordinates: Coordinate[];
}) {
  if (coordinates.length < 2) return null;
  const points = coordinates.map(([longitude, latitude]) => ({
    latitude,
    longitude,
  }));
  return (
    <>
      <Polyline
        coordinates={points}
        strokeColor={colors.routeCasing}
        strokeWidth={11}
        lineCap="round"
        lineJoin="round"
      />
      <Polyline
        coordinates={points}
        strokeColor={colors.route}
        strokeWidth={6}
        lineCap="round"
        lineJoin="round"
      />
    </>
  );
});
