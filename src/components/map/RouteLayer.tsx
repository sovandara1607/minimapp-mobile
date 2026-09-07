import { memo } from "react";
import { Polyline } from "react-native-maps";
import { colors } from "../../constants/theme";
import type { Coordinate } from "../../types/map";

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
