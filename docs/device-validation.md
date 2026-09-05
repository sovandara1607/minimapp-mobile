# Milestone 1 device acceptance

Milestone 1 is implemented, but stability requires a working Google Maps API key on Android (no setup needed on iOS) and native device checks. Follow this on an iPhone and Android phone before starting Milestone 2.

1. Fresh install: grant foreground location. Confirm first position appears, heading follows orientation, and the player sits at approximately 68% of the map viewport height. Confirm Apple/Google's required map attribution is accessible. On iOS, confirm the forward-offset camera and altitude/zoom approximation (see README) still lands the player near 68% and at a sensible scale — tune `CAMERA` in `src/constants/camera.ts` if not.
2. Deny once, retry, deny permanently, and disable system Location Services. Confirm recovery copy and Settings action; return from Settings and confirm subscriptions recover without duplicate sensors.
3. Enable simulation without GPS permission. Observe a full loop (about two minutes). Confirm smooth cornering, visible neutral buildings where available, no jump at the loop seam, and no sudden 180° rotation.
4. Pan, pinch, rotate, and pitch during motion and while recentering. Confirm following stops, gestures remain responsive, and recenter smoothly restores bearing, pitch, zoom, and the player's low-screen position. On iOS specifically, confirm a plain pinch/rotate with no pan still triggers Explore mode (the `isGesture` flag react-native-maps reports on region changes is Android-only, so iOS relies on a fallback heuristic — see `useNavigationCamera.ts`). Toggle 2D/3D in both follow and explore. Face north and recenter again.
5. Walk slowly while rotating the device across 359°/0°. Then test vehicle movement as a passenger: course should dominate at driving speed; stopping should return to compass without oscillation. Watch diagnostics for poor accuracy or unavailable compass.
6. Background/foreground repeatedly; stop/start simulation; enter and leave developer controls. Confirm no background location permission or tracking and no interpolation between unrelated mock/real coordinates.
7. Go offline, restore connectivity, and reload the map. Temporarily block GPS (indoors) and confirm the stale signal indicator rather than invented movement.
8. Test a small display, large text, and VoiceOver/TalkBack. Check controls, attribution, permission actions, and speed readout remain accessible.
9. Profile a release-like development build on actual phones. Target 60 FPS and inspect native/JS frame time, puck/camera alignment, thermal load, and battery use for at least ten minutes. Native map interpolation and GPS timing vary by platform; tune camera.ts/motionEngine.ts based on measurements.

## Automated checks completed

- Strict TypeScript compilation.
- 12 deterministic tests for motion, camera geometry, simulation, and style schema.
- iOS and Android Metro/Hermes production bundle export.
- Expo native prebuild for both platforms.

Actual device results are not yet recorded. A simulator preview cannot establish real-GPS accuracy or physical-device performance.
