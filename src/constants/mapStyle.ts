import type { MapStyleElement } from "react-native-maps";
import { colors } from "./theme";

export const GOOGLE_MAP_STYLE: MapStyleElement[] = [
  { elementType: "geometry", stylers: [{ color: colors.land }] },
  { elementType: "labels.text.fill", stylers: [{ color: colors.muted }] },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: colors.road }, { weight: 2 }],
  },
  { featureType: "administrative", stylers: [{ visibility: "off" }] },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: colors.park, visibility: "on" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry.fill",
    stylers: [{ color: colors.land }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: colors.minorRoad }],
  },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  {
    featureType: "road.arterial",
    elementType: "geometry.fill",
    stylers: [{ color: colors.road }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: colors.road }],
  },
  {
    featureType: "road.highway",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: colors.muted }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: colors.water }] },
  { featureType: "water", elementType: "labels", stylers: [{ visibility: "off" }] },
];
