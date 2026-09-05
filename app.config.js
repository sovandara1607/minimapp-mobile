// app.config.js instead of app.json so the Android Google Maps key can be read
// from an env var at prebuild/build time. Expo CLI loads .env.local into
// process.env before evaluating this file (see .env.example).
const androidGoogleMapsApiKey = process.env.ANDROID_GOOGLE_MAPS_API_KEY ?? "";

module.exports = {
  expo: {
    name: "Minimapp",
    slug: "minimapp-mobile",
    version: "0.1.0",
    scheme: "minimapp",
    orientation: "default",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.minimapp.mobile",
      // Apple Maps is the default iOS map provider — no API key or login needed.
    },
    android: {
      package: "com.minimapp.mobile",
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"],
      adaptiveIcon: {
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundColor: "#CCD3C9",
      },
    },
    plugins: [
      "expo-router",
      "./plugins/withSceneDelegate",
      ["react-native-maps", { androidGoogleMapsApiKey }],
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Minimapp uses your location to smoothly follow your position and direction while the map is open.",
          isIosBackgroundLocationEnabled: false,
          isAndroidBackgroundLocationEnabled: false,
          isAndroidForegroundServiceEnabled: false,
          locationAlwaysPermission: false,
          locationAlwaysAndWhenInUsePermission: false,
          motionUsagePermission: false,
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
