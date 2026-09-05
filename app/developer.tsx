import { Redirect, router } from "expo-router";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { colors } from "../src/constants/theme";
import { useMapStore } from "../src/stores/mapStore";
import { ActionButton } from "../src/components/ui/ActionButton";
export default function DeveloperScreen() {
  const mock = useMapStore((s) => s.mock);
  const debug = useMapStore((s) => s.debug);
  const setMock = useMapStore((s) => s.setMock);
  const toggleDebug = useMapStore((s) => s.toggleDebug);
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
    >
      <Text style={styles.intro}>Test the feeling.</Text>
      <Text style={styles.detail}>
        A repeatable drive for tuning the camera, movement, and heading. No
        location permission needed.
      </Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.label}>
            <Text style={styles.title}>Simulated drive</Text>
            <Text style={styles.caption}>
              South Park · 28.8 km/h · continuous loop
            </Text>
          </View>
          <Switch
            accessibilityLabel="Simulated drive"
            value={mock}
            onValueChange={setMock}
            trackColor={{ true: colors.accent }}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <View style={styles.label}>
            <Text style={styles.title}>Map diagnostics</Text>
            <Text style={styles.caption}>
              Location, heading, and camera telemetry
            </Text>
          </View>
          <Switch
            accessibilityLabel="Map diagnostics"
            value={debug}
            onValueChange={toggleDebug}
            trackColor={{ true: colors.accent }}
          />
        </View>
      </View>
      <Text style={styles.detail}>
        Pan or rotate to explore. Recenter restores the follow camera. Tap N to
        face north, or 3D to change perspective.
      </Text>
      <ActionButton label="Back to map" primary onPress={() => router.back()} />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  content: { padding: 24, paddingBottom: 48, gap: 24 },
  intro: {
    fontSize: 32,
    letterSpacing: -1,
    fontWeight: "600",
    color: colors.ink,
  },
  detail: { fontSize: 15, lineHeight: 23, color: colors.muted },
  card: { backgroundColor: "#E8EDE3", borderRadius: 24, padding: 20, gap: 22 },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  label: { flex: 1, gap: 6 },
  title: { color: colors.ink, fontSize: 16, fontWeight: "600" },
  caption: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  divider: { height: 1, backgroundColor: colors.border },
});
