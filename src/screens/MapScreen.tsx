import { Pressable, StyleSheet, Text, View } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../constants/theme";
import { useMapStore } from "../stores/mapStore";
import { useOrientation } from "../hooks/useOrientation";
import { ActionButton } from "../components/ui/ActionButton";
import { Icon } from "../components/ui/Icon";

const isNativeBuild =
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
// Delay the native module import so accidentally opening Expo Go shows useful guidance.
const NativeMap = isNativeBuild
  ? (require("../components/map/MiniMap")
      .MiniMap as typeof import("../components/map/MiniMap").MiniMap)
  : null;
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { isLandscape } = useOrientation();
  const mock = useMapStore((s) => s.mock);
  const setMock = useMapStore((s) => s.setMock);

  const devControl = mock ? (
    <ActionButton
      label="Stop simulation"
      compact
      onPress={() => setMock(false)}
    >
      <Icon name="pause" size={18} />
    </ActionButton>
  ) : (
    <Link href="/developer" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Developer controls"
        style={styles.devLink}
      >
        <Icon name="settings" size={21} />
      </Pressable>
    </Link>
  );
  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + (isLandscape ? 8 : 12),
          paddingBottom: Math.max(insets.bottom, isLandscape ? 10 : 18),
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
        },
      ]}
    >
      <View
        style={[styles.header, isLandscape && styles.headerLandscape]}
      >
        <View>
          {!isLandscape && (
            <Text style={styles.eyebrow}>YOUR WORLD, IN VIEW</Text>
          )}
          <Text
            accessibilityRole="header"
            style={[styles.brand, isLandscape && styles.brandCompact]}
          >
            minimapp<Text style={{ color: colors.accent }}>.</Text>
          </Text>
        </View>
        {!isLandscape && (
          <View style={styles.mark}>
            <Icon name="arrow" size={23} />
          </View>
        )}
        {isLandscape && __DEV__ && devControl}
      </View>
      {NativeMap ? (
        <NativeMap />
      ) : (
        <View style={styles.setup}>
          <View style={styles.setupIcon}>
            <Icon name="layers" size={32} />
          </View>
          <Text style={styles.title}>A native map deserves a native build.</Text>
          <Text selectable style={styles.body}>
            react-native-maps needs an Expo development build. Install the iOS
            or Android development client, then open this project there.
          </Text>
          <Text selectable style={styles.code}>
            npm run ios  /  npm run android
          </Text>
        </View>
      )}
      {!isLandscape && (
        <>
          <View style={styles.footer}>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={styles.footerTitle}>
                {mock ? "Take the scenic loop." : "A little perspective."}
              </Text>
              <Text style={styles.footerDetail}>
                {mock
                  ? "South Park, San Francisco · simulation"
                  : "Move freely. Your map moves with you."}
              </Text>
            </View>
            {__DEV__ && devControl}
          </View>
          {__DEV__ && mock && (
            <Link href="/developer" style={styles.debugLink}>
              Developer controls
            </Link>
          )}
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.paper,
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 9,
    paddingBottom: 1,
  },
  headerLandscape: { paddingBottom: 0, gap: 10 },
  eyebrow: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: "600",
    marginBottom: 5,
  },
  brand: {
    color: colors.ink,
    fontSize: 31,
    fontWeight: "700",
    letterSpacing: -1.6,
  },
  brandCompact: { fontSize: 20, letterSpacing: -1 },
  mark: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 9,
    paddingTop: 1,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: -0.4,
    color: colors.ink,
  },
  footerDetail: { fontSize: 11, color: colors.muted, lineHeight: 16 },
  devLink: {
    width: 48,
    height: 48,
    padding: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    overflow: "hidden",
  },
  debugLink: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: -10,
  },
  setup: {
    flex: 1,
    padding: 26,
    gap: 18,
    justifyContent: "center",
    borderRadius: 32,
    backgroundColor: "#E3EADF",
    borderWidth: 1,
    borderColor: colors.border,
  },
  setupIcon: {
    width: 72,
    height: 72,
    backgroundColor: colors.paper,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "600",
    letterSpacing: -1,
    color: colors.ink,
  },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted },
  code: {
    fontSize: 11,
    lineHeight: 18,
    fontFamily: "monospace",
    color: colors.ink,
  },
});
