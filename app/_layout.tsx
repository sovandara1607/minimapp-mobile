import "react-native-reanimated";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "../src/constants/theme";
export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{ contentStyle: { backgroundColor: colors.paper } }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Minimapp", headerShown: false }}
        />
        <Stack.Screen
          name="developer"
          options={{
            title: "Developer controls",
            presentation: "modal",
            headerTintColor: colors.ink,
            headerStyle: { backgroundColor: colors.paper },
            headerShadowVisible: false,
          }}
        />
      </Stack>
    </>
  );
}
