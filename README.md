# Minimapp

An original, game-inspired native mini-map built with Expo, Expo Router, TypeScript, `react-native-maps` (Apple Maps on iOS, Google Maps on Android), expo-location, Zustand, and Reanimated. **Milestone 1 only.**

No Mapbox account is required anywhere in this project.

## Run

```sh
npm install
cp .env.example .env.local # only if .env.local does not already exist
```

Building for **Android** needs a free Google Maps API key (Android only — iOS needs nothing):

1. Go to [console.cloud.google.com](https://console.cloud.google.com/), create or select a project.
2. Enable **"Maps SDK for Android"**.
3. Create an API key under Credentials, and set `ANDROID_GOOGLE_MAPS_API_KEY` in `.env.local` to it. Restrict the key to your Android package (`com.minimapp.mobile`) once you have a keystore.

This is a single Google account login — no separate download-token step like Mapbox required. The key is read only at prebuild/build time (via `app.config.js`) to write the native `AndroidManifest`; it is never bundled into the JS app, so it doesn't need an `EXPO_PUBLIC_` prefix. `.env.local` is ignored by Git.

```sh
npm run ios       # Xcode + CocoaPods required
npm run android   # Android SDK + emulator/device required
```

These commands compile and install an **Expo development client**. `react-native-maps` is a native module and does not run inside Expo Go. Once the client is installed:

```sh
npm start
```

Changing `ANDROID_GOOGLE_MAPS_API_KEY` requires a native rebuild (`npx expo prebuild --clean` then `npm run android`) — it's written into the Android manifest, not read at JS runtime, so restarting Metro alone won't pick it up.

### EAS development builds

```sh
npx eas-cli login
npx eas-cli build:configure
npm run build:ios:dev
npm run build:android:dev
```

Use `npx eas-cli build --platform ios --profile development-simulator` for an iOS simulator build. Set `ANDROID_GOOGLE_MAPS_API_KEY` in the EAS environment used for your Android build. Set your own bundle identifier/package before distributing. No cloud build or store submission is performed automatically.

## Why Apple Maps + Google Maps instead of Mapbox

Mapbox needs an account for two things: a public style token, and a separate native-SDK download credential — both gated behind signing in. `react-native-maps` needs no login for iOS at all, and only a plain Google Maps API key for Android.

The trade-off is real and worth knowing about:

- **Custom map styling only applies on Android.** Google Maps supports a JSON style (`src/constants/mapStyle.ts`, applied via `customMapStyle`) that reproduces the sage/gray/blue palette. Apple Maps (MapKit) has no equivalent JSON styling API, so **iOS renders in standard Apple Maps colors**. 3D buildings still render natively on both platforms (`showsBuildings`), just not in the custom muted gray.
- **Camera zoom vs. altitude.** `react-native-maps`' `Camera.zoom` only works on Google Maps; iOS MapKit uses `altitude` (meters) instead. `src/constants/camera.ts` converts between them with a community-standard approximation (`altitudeForZoom`) — it's close, not exact; verify visually on a real iPhone and adjust if needed.
- **No live camera-padding.** Unlike Mapbox, there's no way to keep a *continuously following* camera off-center natively. The player-below-center look is achieved by aiming the camera at a point projected ahead of the player instead of at the player directly (`forwardOffsetMeters` + `projectForward`), so the real position falls behind it on screen. This is an approximation of true perspective-correct padding — tune `CAMERA.playerScreenFraction` on device if it drifts.
- **Manual-pan detection differs.** `onRegionChangeComplete`'s `isGesture` flag (used to detect the user has taken over the camera and enter Explore mode) is Google Maps only. iOS falls back to a "did we just move the camera ourselves" time window plus `onPanDrag`, which is slightly less precise but works.
- **Animation duration is best-effort on iOS.** `animateCamera`'s `duration` option isn't honored by MapKit; iOS still animates (via its own default transition) but without our exact easing timing. Android (Google Maps) gets the fully-controlled version.

If this ever becomes a blocker, the fix is a single Google Cloud login: add an `iosGoogleMapsApiKey` and pass `provider={PROVIDER_GOOGLE}` on iOS too, which removes every limitation above.

## Use

- **Follow:** heading-oriented map, 42° pitch, zoom 16.6; player at ~68% of the map height.
- **Explore:** pan, zoom, rotate, or pitch to suspend following. Recenter returns smoothly to follow (or simulated drive).
- **N:** face north and enter explore.
- **2D / 3D:** change pitch while preserving the current mode.
- **Developer controls:** footer control opens simulated driving and diagnostics. The simulation follows a continuous South Park, San Francisco circuit at 28.8 km/h and requires no GPS permission — it still needs a working map provider (Google key on Android) for map tiles.
- **Simulation:** uses 50° pitch and speed-dependent zoom. Stop with the footer pause button or the developer switch. These controls and diagnostics are guarded by `__DEV__`.

Location is foreground-only. Permission denial, permanent denial/restriction, disabled services, unreliable fixes, compass unavailability, stale signals, missing configuration, and map loading errors have explicit states. Expo does not distinguish an administrator restriction from permanent denial; both lead to the Settings recovery state. No location data is sent to an application backend; map data is supplied by Apple/Google's map SDKs.

## Architecture

```text
app/                     Expo Router screen and developer modal
src/components/map/      Native map, puck, HUD, controls, permission and debug views
src/hooks/                Foreground lifecycle, GPS/heading subscriptions, camera controller
src/services/            Expo location adapter, pure motion engine, deterministic simulation
src/stores/mapStore.ts   Low-frequency location metadata and map/UI state
src/constants/           Camera tuning, Google Maps style, palette, mock circuit
src/types/               Shared coordinates, sensor and camera types
src/utils/geo.ts         Geodesic distance, bearing, coordinate interpolation, forward projection
```

**One data path:** real GPS or mock fixes → validation/outlier rejection → motion engine → native puck marker and imperative camera. Walking favors fresh compass data; driving uses reliable GPS course with speed hysteresis. The heading filter rejects isolated reversals, takes the shortest arc over north, and caps turn rate. Coordinates converge to targets through time-based interpolation. Pausing the app tears down sensors and timers; switching sources resets the engine.

The engine publishes at **5 Hz**, isolated to the native location-provider leaf and the imperative camera subscriber (`useNavigationCamera`, which drives `MapView.animateCamera` directly — there's no separate `<Camera>` element like Mapbox's, so the camera hook doubles as the source of the map's gesture handlers). The player marker (`PlayerPuck`) is a `Marker` with `flat` + a native `rotation` prop, so heading rotation happens in the native layer, not React. No React state update, GeoJSON reconstruction, or JS worklet bridge call occurs on every display frame. HUD sensor metadata updates at source rate (approximately 1 Hz); camera diagnostics are read back via `getCamera()` and capped at ~3 Hz. A 60 FPS target is configured, but frame rate and animation quality must be measured on physical phones — see the platform trade-offs above, which affect iOS more than Android.

## Checks

```sh
npm run check
npx expo-doctor
npx expo export --platform ios --platform android --output-dir artifacts/bundle
```

Tests cover north crossing, compass spikes, smooth position convergence, GPS accuracy/outliers/order, compass/course selection, stale headings, source reset, simulation continuity, date-line interpolation, forward camera offset, and the Google Maps style shape.

See [device validation](docs/device-validation.md) for the remaining real-phone acceptance checks. Do not treat a passing JS bundle or unit tests as confirmation that native motion is stable — this matters even more here than with Mapbox, given the iOS approximations noted above.

## Scope

No search, destination selection, routing API, route line, ETA, route overview, backend, authentication, or persistence. Those belong to later milestones after the core map experience passes device testing.
