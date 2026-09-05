import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Mapbox, { MapView, type MapState } from "@rnmapbox/maps";
import { MAP_STYLE_JSON } from "../../constants/mapStyle";
import { colors } from "../../constants/theme";
import { useMapStore } from "../../stores/mapStore";
import { useUserLocation } from "../../hooks/useUserLocation";
import { NavigationCamera } from "./NavigationCamera";
import { PlayerPuck } from "./PlayerPuck";
import { MapHUD } from "./MapHUD";
import { MapControls } from "./MapControls";
import { LocationState } from "./LocationState";
import { DebugOverlay } from "./DebugOverlay";
import { ActionButton } from "../ui/ActionButton";

void Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "");
export function MiniMap() {
  const [height, setHeight] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  const debug = useMapStore((s) => s.debug);
  const { requestLocation, retry, active } = useUserLocation();
  const lastTelemetry = useRef(0);
  const onCameraChanged = useCallback((event: MapState) => {
    const state = useMapStore.getState();
    if (event.gestures.isGestureActive && state.mode !== "explore")
      state.setMode("explore");
    if (Date.now() - lastTelemetry.current > 500) {
      lastTelemetry.current = Date.now();
      useMapStore.setState({
        camera: {
          bearing: event.properties.heading,
          zoom: event.properties.zoom,
          pitch: event.properties.pitch,
        },
      });
    }
  }, []);
  return (
    <View
      style={styles.map}
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
    >
      <MapView
        key={revision}
        style={StyleSheet.absoluteFill}
        styleJSON={MAP_STYLE_JSON}
        scaleBarEnabled={false}
        compassEnabled={false}
        logoEnabled
        attributionEnabled
        logoPosition={{ left: 14, bottom: 14 }}
        attributionPosition={{ right: 14, bottom: 14 }}
        pitchEnabled
        rotateEnabled
        scrollEnabled
        zoomEnabled
        preferredFramesPerSecond={60}
        onCameraChanged={onCameraChanged}
        onDidFinishLoadingStyle={() => {
          setReady(true);
          setError(false);
        }}
        onMapLoadingError={() => setError(true)}
      >
        <NavigationCamera height={height} ready={ready} active={active} />
        <PlayerPuck />
      </MapView>
      <MapHUD />
      <MapControls />
      {!ready && !error && (
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
      {error && (
        <View style={styles.error}>
          <Text selectable style={styles.errorText}>
            The map couldn’t load. Check your connection and Mapbox token.
          </Text>
          <ActionButton
            label="Reload map"
            onPress={() => {
              setReady(false);
              setError(false);
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
