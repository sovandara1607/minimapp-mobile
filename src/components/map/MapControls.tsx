import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useMapStore } from "../../stores/mapStore";
import { colors } from "../../constants/theme";
import { ActionButton } from "../ui/ActionButton";
import { Icon } from "../ui/Icon";
export function MapControls() {
  const mode = useMapStore((s) => s.mode);
  const is3D = useMapStore((s) => s.is3D);
  const recenter = useMapStore((s) => s.recenter);
  const northUp = useMapStore((s) => s.northUp);
  const toggle3D = useMapStore((s) => s.toggle3D);
  return (
    <View style={styles.controls} pointerEvents="box-none">
      <View style={styles.column}>
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
      </View>
      {mode === "explore" && (
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOutDown.duration(160)}
          style={styles.recenter}
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
  recenter: { position: "absolute", bottom: 40, alignSelf: "center" },
  north: { color: colors.ink, fontWeight: "700", fontSize: 17 },
  dimension: { color: colors.ink, fontWeight: "600", fontSize: 13 },
});
