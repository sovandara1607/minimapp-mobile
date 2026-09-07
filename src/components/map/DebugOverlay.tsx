import { ScrollView, StyleSheet, Text } from "react-native";
import { useMapStore } from "../../stores/mapStore";
import { useEffect, useState } from "react";
import { motionEngine } from "../../services/motionEngine";
import { useOrientation } from "../../hooks/useOrientation";
export function DebugOverlay() {
  const state = useMapStore();
  const { isLandscape } = useOrientation();
  const [heading, setHeading] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setHeading(motionEngine.getSnapshot()?.heading ?? 0),
      500,
    );
    return () => clearInterval(timer);
  }, []);
  if (!__DEV__ || !state.debug) return null;
  const rows = [
    `MODE      ${state.mode} / ${state.mock ? "MOCK" : "GPS"}`,
    `ACCURACY  ${state.fix?.accuracy?.toFixed(1) ?? "—"} m`,
    `LAT       ${state.fix?.coordinate[1].toFixed(6) ?? "—"}`,
    `LON       ${state.fix?.coordinate[0].toFixed(6) ?? "—"}`,
    `HEADING   ${heading.toFixed(1)}°`,
    `COURSE    ${state.fix?.course?.toFixed(1) ?? "—"}°`,
    `SPEED     ${state.fix?.speed.toFixed(1) ?? "—"} m/s`,
    `CAMERA    ${state.camera.bearing.toFixed(1)}°`,
    `ZOOM      ${state.camera.zoom.toFixed(2)}`,
    `PITCH     ${state.camera.pitch.toFixed(1)}°`,
    `STATUS    ${state.status}${state.stale ? " / stale" : ""}`,
  ];
  return (
    <ScrollView
      style={[styles.panel, isLandscape && styles.panelLandscape]}
      contentContainerStyle={{ padding: 14 }}
    >
      <Text selectable style={styles.text}>
        {rows.join("\n")}
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  panel: {
    position: "absolute",
    top: 74,
    left: 16,
    maxHeight: 230,
    borderRadius: 16,
    backgroundColor: "rgba(26,42,39,0.93)",
  },
  panelLandscape: { top: 54, maxHeight: 150 },
  text: {
    fontFamily: "monospace",
    color: "#DFECE1",
    fontSize: 10,
    lineHeight: 18,
  },
});
