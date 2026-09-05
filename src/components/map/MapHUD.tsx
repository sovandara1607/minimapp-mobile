import { StyleSheet, Text, View } from "react-native";
import { useMapStore } from "../../stores/mapStore";
import { colors } from "../../constants/theme";
import { Icon } from "../ui/Icon";
export function MapHUD() {
  const mode = useMapStore((s) => s.mode);
  const mock = useMapStore((s) => s.mock);
  const speed = useMapStore((s) => s.fix?.speed);
  const accuracy = useMapStore((s) => s.fix?.accuracy);
  const stale = useMapStore((s) => s.stale);
  const headingAvailable = useMapStore((s) => s.headingAvailable);
  return (
    <View pointerEvents="none" style={styles.hud}>
      <View style={styles.mode}>
        <View style={[styles.dot, stale && { backgroundColor: "#A07A42" }]} />
        <Text style={styles.label}>
          {mode === "explore"
            ? "Free explore"
            : mock
              ? "Simulated drive"
              : "Following you"}
        </Text>
      </View>
      <View style={styles.bottom}>
        <View style={styles.readout}>
          <Text selectable style={styles.speed}>
            {speed === undefined ? "—" : Math.round(speed * 3.6)}
          </Text>
          <Text style={styles.unit}>km/h</Text>
        </View>
        <View style={styles.signal}>
          <Icon name="signal" size={13} color={colors.muted} />
          <Text style={styles.caption}>
            {stale
              ? "Signal interrupted"
              : !headingAvailable
                ? "Compass unavailable"
                : accuracy === null || accuracy === undefined
                  ? "Finding your position"
                  : mock
                    ? "Simulation"
                    : `GPS ±${Math.round(accuracy)} m`}
          </Text>
        </View>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  hud: { ...StyleSheet.absoluteFill },
  mode: {
    position: "absolute",
    top: 18,
    left: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: colors.glass,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  label: { fontSize: 12, fontWeight: "600", color: colors.ink },
  bottom: { position: "absolute", bottom: 72, left: 22, gap: 6 },
  readout: { flexDirection: "row", alignItems: "baseline", gap: 5 },
  speed: {
    fontSize: 30,
    fontWeight: "500",
    color: colors.ink,
    letterSpacing: -1,
    fontVariant: ["tabular-nums"],
  },
  unit: { color: colors.muted, fontSize: 11 },
  signal: { flexDirection: "row", alignItems: "center", gap: 5 },
  caption: { color: colors.muted, fontSize: 10 },
});
