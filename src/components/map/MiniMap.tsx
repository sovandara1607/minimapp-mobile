import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, type LongPressEvent } from "react-native-maps";
import { GOOGLE_MAP_STYLE } from "../../constants/mapStyle";
import { CAMERA, altitudeForZoom } from "../../constants/camera";
import { MOCK_ROUTE } from "../../constants/mockRoute";
import { colors } from "../../constants/theme";
import { useMapStore } from "../../stores/mapStore";
import { useNavigationStore } from "../../stores/navigationStore";
import { useUserLocation } from "../../hooks/useUserLocation";
import { useNavigationCamera } from "../../hooks/useNavigationCamera";
import { useRoute } from "../../hooks/useRoute";
import { useRerouting } from "../../hooks/useRerouting";
import { useOrientation } from "../../hooks/useOrientation";
import { PlayerPuck } from "./PlayerPuck";
import { RouteLayer } from "./RouteLayer";
import { DestinationMarker } from "./DestinationMarker";
import { DestinationSearch } from "./DestinationSearch";
import { MapHUD } from "./MapHUD";
import { MapControls } from "./MapControls";
import { LocationState } from "./LocationState";
import { DebugOverlay } from "./DebugOverlay";
import { ActionButton } from "../ui/ActionButton";
import { formatDistance } from "../../utils/format";

const initialCamera = {
  center: { latitude: MOCK_ROUTE[0]![1], longitude: MOCK_ROUTE[0]![0] },
  zoom: CAMERA.followZoom,
  pitch: CAMERA.followPitch,
  heading: 0,
  altitude: altitudeForZoom(CAMERA.followZoom),
};
const androidOnlyStyle = Platform.OS === "android" ? GOOGLE_MAP_STYLE : undefined;
const READY_TIMEOUT_MS = 9000;

export function MiniMap() {
  const map = useRef<MapView>(null);
  const [height, setHeight] = useState(0);
  const [ready, setReady] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [revision, setRevision] = useState(0);
  const debug = useMapStore((s) => s.debug);
  const destination = useNavigationStore((s) => s.destination);
  const route = useNavigationStore((s) => s.route);
  const navigating = useNavigationStore((s) => s.navigating);
  const { isLandscape } = useOrientation();
  const { requestLocation, retry, active } = useUserLocation();
  const { onPanDrag, onRegionChangeComplete } = useNavigationCamera(
    map,
    height,
    ready,
    active,
  );
  useRoute();
  useRerouting();
  const onLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
    setHeight(event.nativeEvent.layout.height);
  }, []);
  const onMapReady = useCallback(() => {
    setReady(true);
    setStalled(false);
  }, []);
  const onLongPress = useCallback((event: LongPressEvent) => {
    const { coordinate } = event.nativeEvent;
    useNavigationStore.getState().setDestination({
      coordinate: [coordinate.longitude, coordinate.latitude],
      label: "Dropped pin",
    });
    useMapStore.getState().setMode("explore");
  }, []);
  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setStalled(true), READY_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [ready, revision]);
  useEffect(() => {
    if (!route || navigating) return;
    const points = route.coordinates.map(([longitude, latitude]) => ({
      latitude,
      longitude,
    }));
    map.current?.fitToCoordinates(points, {
      edgePadding: isLandscape
        ? { top: 70, right: 90, bottom: 90, left: 60 }
        : { top: 100, right: 60, bottom: 220, left: 60 },
      animated: true,
    });
  }, [route, navigating, isLandscape]);
  return (
    <View style={styles.map} onLayout={onLayout}>
      <MapView
        key={revision}
        ref={map}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        customMapStyle={androidOnlyStyle}
        initialCamera={initialCamera}
        showsBuildings
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation
        showsScale={false}
        showsIndoors={false}
        showsTraffic={false}
        showsPointsOfInterests
        toolbarEnabled={false}
        rotateEnabled
        pitchEnabled
        scrollEnabled
        zoomEnabled
        minZoomLevel={CAMERA.minZoom}
        maxZoomLevel={CAMERA.maxZoom}
        onPanDrag={onPanDrag}
        onRegionChangeComplete={onRegionChangeComplete}
        onMapReady={onMapReady}
        onLongPress={onLongPress}
      >
        {route && <RouteLayer coordinates={route.coordinates} />}
        {destination && (
          <DestinationMarker
            destination={destination}
            detail={route ? formatDistance(route.distanceMeters) : undefined}
          />
        )}
        <PlayerPuck />
      </MapView>
      <View
        style={[
          styles.search,
          isLandscape && styles.searchLandscape,
        ]}
        pointerEvents="box-none"
      >
        <DestinationSearch compact={isLandscape} />
      </View>
      <MapHUD />
      <MapControls />
      {!ready && !stalled && (
        <View pointerEvents="none" style={styles.loading}>
          <ActivityIndicator color={colors.ink} />
          <Text style={styles.loadingText}>Opening the map</Text>
        </View>
      )}
      <LocationState
        onRequest={() => {
          void requestLocation();
        }}
        onRetry={retry}
      />
      {__DEV__ && debug && <DebugOverlay />}
      {stalled && (
        <View style={styles.error}>
          <Text selectable style={styles.errorText}>
            The map is taking a while to load. Check your connection
            {Platform.OS === "android"
              ? " and that ANDROID_GOOGLE_MAPS_API_KEY is set."
              : "."}
          </Text>
          <ActionButton
            label="Reload map"
            onPress={() => {
              setReady(false);
              setStalled(false);
              setRevision((value) => value + 1);
            }}
          />
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  map: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 32,
    borderCurve: "continuous",
    backgroundColor: colors.land,
    borderWidth: 1,
    borderColor: "#E7EDE3",
  },
  search: { position: "absolute", top: 70, left: 18, right: 18 },
  searchLandscape: { top: 46, right: undefined, width: 380, maxWidth: "58%" },
  loading: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  loadingText: { color: colors.ink, fontSize: 12 },
  error: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    padding: 16,
    gap: 12,
    borderRadius: 20,
    backgroundColor: colors.paper,
  },
  errorText: { color: colors.ink, fontSize: 13, lineHeight: 19 },
});
