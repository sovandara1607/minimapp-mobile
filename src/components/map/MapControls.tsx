import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useMapStore } from "../../stores/mapStore";
import { useNavigationStore } from "../../stores/navigationStore";
import { colors } from "../../constants/theme";
import { useOrientation } from "../../hooks/useOrientation";
import { formatDistance, formatDuration } from "../../utils/format";
import { ActionButton } from "../ui/ActionButton";
import { Icon } from "../ui/Icon";
export function MapControls() {
  const mode = useMapStore((s) => s.mode);
  const is3D = useMapStore((s) => s.is3D);
  const recenter = useMapStore((s) => s.recenter);
  const northUp = useMapStore((s) => s.northUp);
  const toggle3D = useMapStore((s) => s.toggle3D);
  const destination = useNavigationStore((s) => s.destination);
  const route = useNavigationStore((s) => s.route);
  const routeStatus = useNavigationStore((s) => s.routeStatus);
  const navigating = useNavigationStore((s) => s.navigating);
  const clearDestination = useNavigationStore((s) => s.clearDestination);
  const startNavigating = useNavigationStore((s) => s.startNavigating);
  const stopNavigating = useNavigationStore((s) => s.stopNavigating);
  const { isLandscape } = useOrientation();
  return (
    <View style={styles.controls} pointerEvents="box-none">
      <View style={[styles.column, isLandscape && styles.columnLandscape]}>
        <ActionButton label="Face north" compact onPress={northUp}>
          <Text style={styles.north}>N</Text>
        </ActionButton>
        <ActionButton
          label={is3D ? "Switch to 2D" : "Switch to 3D"}
          compact
          onPress={toggle3D}
          selected={is3D}
        >
          <Text style={styles.dimension}>{is3D ? "3D" : "2D"}</Text>
        </ActionButton>
        {mode === "explore" && destination && (
          <ActionButton label="Show my location" compact onPress={recenter}>
            <Icon name="locate" size={19} />
          </ActionButton>
        )}
      </View>
      {destination && (
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOutDown.duration(160)}
          style={[styles.routeCard, isLandscape && styles.routeCardLandscape]}
        >
          <View style={styles.routeInfo}>
            <Text numberOfLines={1} style={styles.routeTitle}>
              {destination.label}
            </Text>
            <Text style={styles.routeDetail}>
              {routeStatus === "loading"
                ? "Finding a route…"
                : routeStatus === "rerouting"
                  ? "Off route · rerouting…"
                  : routeStatus === "error"
                    ? "Couldn't find a route"
                    : route
                      ? `${formatDistance(route.distanceMeters)} · ${formatDuration(route.durationSeconds)}`
                      : ""}
            </Text>
          </View>
          {navigating ? (
            <ActionButton label="Stop" compact onPress={stopNavigating}>
              <Icon name="pause" size={16} />
            </ActionButton>
          ) : (
            <ActionButton
              label="Clear"
              compact
              onPress={() => {
                clearDestination();
                recenter();
              }}
            >
              <Icon name="close" size={16} />
            </ActionButton>
          )}
          {route && !navigating && (
            <ActionButton
              label="Start"
              compact
              primary
              onPress={() => {
                startNavigating();
                recenter();
              }}
            >
              <Icon name="play" color={colors.paper} size={16} />
            </ActionButton>
          )}
        </Animated.View>
      )}
      {mode === "explore" && !destination && (
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOutDown.duration(160)}
          style={[styles.recenter, isLandscape && styles.recenterLandscape]}
        >
          <ActionButton label="Recenter" onPress={recenter} primary>
            <Icon name="locate" color={colors.paper} size={19} />
          </ActionButton>
        </Animated.View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  controls: { ...StyleSheet.absoluteFill },
  column: { position: "absolute", right: 16, top: 94, gap: 10 },
  columnLandscape: { top: 12, flexDirection: "row" },
  recenter: { position: "absolute", bottom: 40, alignSelf: "center" },
  recenterLandscape: { bottom: 16 },
  north: { color: colors.ink, fontWeight: "700", fontSize: 17 },
  dimension: { color: colors.ink, fontWeight: "600", fontSize: 13 },
  routeCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 22,
    borderCurve: "continuous",
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.border,
  },
  routeCardLandscape: { bottom: 12, padding: 10 },
  routeInfo: { flex: 1, gap: 3 },
  routeTitle: { fontSize: 14, fontWeight: "600", color: colors.ink },
  routeDetail: { fontSize: 11, color: colors.muted },
});
