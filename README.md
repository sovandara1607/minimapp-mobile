# Minimapp

An original, game-inspired native mini-map built with Expo, Expo Router, TypeScript, Mapbox, expo-location, Zustand, and Reanimated. **Milestone 1 only.**

## Run

```sh
npm install
cp .env.example .env.local # only if .env.local does not already exist
```

Set `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` in `.env.local` to your public `pk.` token from [Mapbox](https://console.mapbox.com/account/access-tokens/). Public tokens are embedded in the app; never put a secret `sk.` token in an `EXPO_PUBLIC_` variable. `.env.local` is ignored by Git. Restart Metro after changing it.

```sh
npm run ios       # Xcode + CocoaPods required
npm run android   # Android SDK + emulator/device required
```

These commands compile and install an **Expo development client**. Mapbox is a native module and does not run inside Expo Go. Once the client is installed:

```sh
npm start
```

### EAS development builds

```sh
npx eas-cli login
npx eas-cli build:configure
npm run build:ios:dev
npm run build:android:dev
```

Use `npx eas-cli build --platform ios --profile development-simulator` for an iOS simulator build. Configure the public token in the EAS environment used for your build if the build bundles JavaScript remotely. Set your own bundle identifier/package before distributing. No cloud build or store submission is performed automatically.

The installed Mapbox plugin configures native SDK downloads. With @rnmapbox/maps 10.3.5's default SDK, a secret download token is not configured in app.json. See the [Mapbox installation guide](https://rnmapbox.github.io/docs/install) if your account or SDK override requires different credentials; never commit download credentials.

## Use

- **Follow:** heading-oriented map, 42° pitch, zoom 16.6; player at 68% of the map height.
- **Explore:** pan, zoom, rotate, or pitch to suspend following. Recenter returns smoothly to follow (or simulated drive).
- **N:** face north and enter explore.
- **2D / 3D:** change pitch while preserving the current mode.
- **Developer controls:** footer control opens simulated driving and diagnostics. The simulation follows a continuous South Park, San Francisco circuit at 28.8 km/h and requires no GPS permission. It still requires a Mapbox token/network for the map tiles.
- **Simulation:** uses 50° pitch and speed-dependent zoom. Stop with the footer pause button or the developer switch. These controls and diagnostics are guarded by `__DEV__`.

Location is foreground-only. Permission denial, permanent denial/restriction, disabled services, unreliable fixes, compass unavailability, stale signals, missing configuration, and map loading errors have explicit states. Expo does not distinguish an administrator restriction from permanent denial; both lead to the Settings recovery state. No location data is sent to an application backend; map data is supplied by the Mapbox SDK.

## Architecture

```text
app/                     Expo Router screen and developer modal
src/components/map/      Native map, camera, puck, HUD, controls, permission and debug views
src/hooks/               Foreground lifecycle, GPS/heading subscriptions, camera controller
src/services/            Expo location adapter, pure motion engine, deterministic simulation
src/stores/mapStore.ts   Low-frequency location metadata and map/UI state
src/constants/           Camera tuning, original Mapbox style, palette, mock circuit
src/types/               Shared coordinates, sensor and camera types
src/utils/geo.ts         Geodesic distance, shortest bearing, coordinate interpolation
```

**One data path:** real GPS or mock fixes → validation/outlier rejection → motion engine → native puck and imperative camera. Walking favors fresh compass data; driving uses reliable GPS course with speed hysteresis. The heading filter rejects isolated reversals, takes the shortest arc over north, and caps turn rate. Coordinates converge to targets through time-based interpolation. Pausing the app tears down sensors and timers; switching sources resets the engine.

The engine publishes at **5 Hz**, isolated to the native location-provider leaf and the imperative camera subscriber. Mapbox performs intermediate puck/camera animation natively. No React state update, GeoJSON reconstruction, or JS worklet bridge call occurs on every display frame. HUD sensor metadata updates at source rate (approximately 1 Hz); camera diagnostics are capped at 2 Hz. A 60 FPS target is configured, but frame rate and animation quality must be measured on physical phones.

The local Mapbox style uses muted land, parks and water, minimal road labels, and neutral extruded buildings capped at 60 m for visual clarity. Building coverage depends on Mapbox data. Mapbox logo/attribution stay visible.

## Checks

```sh
npm run check
npx expo-doctor
npx expo export --platform ios --platform android --output-dir artifacts/bundle
```

Tests cover north crossing, compass spikes, smooth position convergence, GPS accuracy/outliers/order, compass/course selection, stale headings, source reset, simulation continuity, date-line interpolation, camera padding, and Mapbox style validity.

See [device validation](docs/device-validation.md) for the remaining real-phone acceptance checks. Do not treat a passing JS bundle or unit tests as confirmation that native motion is stable.

## Scope

No search, destination selection, routing API, route line, ETA, route overview, backend, authentication, or persistence. Those belong to later milestones after the core map experience passes device testing.
