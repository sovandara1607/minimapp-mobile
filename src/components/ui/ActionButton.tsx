import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../../constants/theme";
export function ActionButton({
  label,
  onPress,
  children,
  compact = false,
  primary = false,
  selected = false,
}: {
  label: string;
  onPress: () => void;
  children?: ReactNode;
  compact?: boolean;
  primary?: boolean;
  selected?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        primary && styles.primary,
        { opacity: pressed ? 0.65 : 1 },
      ]}
    >
      {children}
      {!compact && (
        <Text style={[styles.label, primary && { color: colors.paper }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderCurve: "continuous",
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  compact: { width: 48, height: 48, paddingHorizontal: 0 },
  primary: { backgroundColor: colors.ink, borderColor: colors.ink },
  label: { color: colors.ink, fontWeight: "600", fontSize: 14 },
});
