import { memo, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Marker } from "react-native-maps";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { colors } from "../../constants/theme";
import type { Destination } from "../../types/navigation";

/** A quiet circular marker with a subtle pulse — no Google-style red pin. */
export const DestinationMarker = memo(function DestinationMarker({
  destination,
  detail,
}: {
  destination: Destination;
  detail?: string;
}) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.45 * (1 - pulse.value),
    transform: [{ scale: 1 + pulse.value * 1.6 }],
  }));
  return (
    <Marker
      coordinate={{
        latitude: destination.coordinate[1],
        longitude: destination.coordinate[0],
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges
    >
      <View style={styles.wrap}>
        <Animated.View style={[styles.pulse, pulseStyle]} />
        <View style={styles.dot} />
        {detail && (
          <View style={styles.label}>
            <Text numberOfLines={1} style={styles.labelText}>
              {detail}
            </Text>
          </View>
        )}
      </View>
    </Marker>
  );
});
const styles = StyleSheet.create({
  wrap: { width: 96, alignItems: "center", justifyContent: "center" },
  pulse: {
    position: "absolute",
    top: 39,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
  },
  dot: {
    marginTop: 30,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.ink,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  label: {
    position: "absolute",
    top: 0,
    maxWidth: 96,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
  },
  labelText: { fontSize: 10, fontWeight: "600", color: colors.ink },
});
