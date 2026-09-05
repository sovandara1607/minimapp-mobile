import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/theme";
export default function MapScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>minimapp.</Text>
      <Text style={styles.body}>This map lives on your phone.</Text>
      <Text selectable style={styles.detail}>
        Run an iOS or Android development build to experience the native 3D map,
        GPS tracking, and smooth follow camera.
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 18,
  },
  title: {
    fontSize: 42,
    color: colors.ink,
    fontWeight: "700",
    letterSpacing: -2,
  },
  body: { fontSize: 22, color: colors.ink },
  detail: {
    maxWidth: 420,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 24,
  },
});
