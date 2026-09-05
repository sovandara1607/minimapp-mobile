import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/theme";
import { useMapStore } from "../../stores/mapStore";
import { Icon } from "../ui/Icon";
import { ActionButton } from "../ui/ActionButton";
const content = {
  checking: ["Getting your bearings", "Checking location access…"],
  undetermined: [
    "Your world, in motion.",
    "Allow location to keep your position and direction in view. Location is only used while the app is open.",
  ],
  denied: [
    "Find your place.",
    "Location access is off. Allow it to follow your movement on the map.",
  ],
  restricted: [
    "Location access is off.",
    "Enable location in Settings. If your device is managed, location may be restricted by its administrator.",
  ],
  unavailable: [
    "Waiting for a signal.",
    "Turn on Location Services and move somewhere with a clear view of the sky.",
  ],
  granted: [
    "Finding your position.",
    "Waiting for a reliable GPS fix. This can take a moment indoors.",
  ],
};
export function LocationState({
  onRequest,
  onRetry,
}: {
  onRequest: () => void;
  onRetry: () => void;
}) {
  const status = useMapStore((s) => s.status);
  const fix = useMapStore((s) => s.fix);
  const stale = useMapStore((s) => s.stale);
  const setMock = useMapStore((s) => s.setMock);
  if (status === "granted" && fix) return null;
  const [title, detail] = content[status];
  const waiting = status === "checking" || (status === "granted" && !stale);
  return (
    <View style={styles.scrim}>
      <View style={styles.card}>
        <View style={styles.symbol}>
          <Icon name="arrow" size={30} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text selectable style={styles.detail}>
          {detail}
        </Text>
        {waiting ? (
          <ActivityIndicator
            color={colors.accent}
            style={{ marginVertical: 12 }}
          />
        ) : (
          <ActionButton
            label={
              status === "restricted"
                ? "Open Settings"
                : status === "unavailable" || status === "granted"
                  ? "Try again"
                  : "Allow location"
            }
            primary
            onPress={
              status === "unavailable" || status === "granted"
                ? onRetry
                : onRequest
            }
          />
        )}
        {__DEV__ && (
          <ActionButton
            label="Try simulated drive"
            onPress={() => setMock(true)}
          />
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(204,211,201,0.6)",
    padding: 22,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    padding: 24,
    borderRadius: 28,
    borderCurve: "continuous",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    gap: 14,
    boxShadow: "0 12px 40px rgba(37,58,56,0.1)",
  },
  symbol: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: "#E3EADF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 27,
    lineHeight: 31,
    letterSpacing: -0.8,
    fontWeight: "600",
    color: colors.ink,
  },
  detail: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    marginBottom: 5,
  },
});
