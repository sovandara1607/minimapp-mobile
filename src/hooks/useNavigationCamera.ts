import { useEffect, useRef } from "react";
import type MapView from "react-native-maps";
import {
  CAMERA,
  altitudeForZoom,
  forwardOffsetMeters,
  speedZoom,
} from "../constants/camera";
import { motionEngine } from "../services/motionEngine";
import { useMapStore } from "../stores/mapStore";
import { angleDelta, normalizeAngle, projectForward } from "../utils/geo";

/**
 * Drives the map camera imperatively via `MapView.animateCamera`.
 * react-native-maps has no separate `<Camera>` element (unlike Mapbox), so
 * this hook both runs the animation loop and returns the gesture handlers
 * `MiniMap` wires onto `<MapView>` to detect manual panning/rotating.
 *
 * A "programmatic window" (`programmaticUntil`) tracks whenever *we* just
 * moved the camera, so `onRegionChangeComplete` — which also fires for our
 * own animations — can tell them apart from a real user gesture. This is
 * the only reliable cross-platform signal: `isGesture` on
 * `onRegionChangeComplete` is Google Maps (Android) only.
 */
export function useNavigationCamera(
  mapRef: React.RefObject<MapView | null>,
  height: number,
  ready: boolean,
  active: boolean,
) {
  const programmaticUntil = useRef(0);
  const lastTelemetry = useRef(0);

  useEffect(() => {
    if (!ready || !height || !active) return;
    const moveCamera = (
      partial: {
        centerCoordinate?: [number, number];
        heading?: number;
        pitch?: number;
        zoom?: number;
      },
      duration: number,
    ) => {
      programmaticUntil.current = Date.now() + duration + 250;
      mapRef.current?.animateCamera(
        {
          ...(partial.centerCoordinate && {
            center: {
              latitude: partial.centerCoordinate[1],
              longitude: partial.centerCoordinate[0],
            },
          }),
          ...(partial.heading !== undefined && {
            heading: normalizeAngle(partial.heading),
          }),
          ...(partial.pitch !== undefined && { pitch: partial.pitch }),
          ...(partial.zoom !== undefined && {
            zoom: partial.zoom,
            altitude: altitudeForZoom(partial.zoom),
          }),
        },
        { duration },
      );
    };
    let transitionUntil = 0;
    let needsTransition = true;
    let heading: number | null = null;
    let reassertTimer: ReturnType<typeof setTimeout> | null = null;
    const update = () => {
      const state = useMapStore.getState();
      const frame = motionEngine.getSnapshot();
      if (!frame || state.mode === "explore" || Date.now() < transitionUntil)
        return;
      // Keep an unwrapped bearing for shortest-path interpolation over north.
      heading =
        heading === null
          ? frame.heading
          : heading + angleDelta(heading, frame.heading);
      const pitch = state.is3D
        ? state.mock
          ? CAMERA.simulationPitch
          : CAMERA.followPitch
        : 0;
      const zoom = state.mock ? speedZoom(frame.speed) : CAMERA.followZoom;
      const offset = forwardOffsetMeters(
        height,
        zoom,
        pitch,
        frame.coordinate[1],
        CAMERA.playerScreenFraction,
      );
      const centerCoordinate = projectForward(frame.coordinate, heading, offset);
      const duration = needsTransition ? CAMERA.transitionMs : CAMERA.frameMs;
      moveCamera({ centerCoordinate, heading, pitch, zoom }, duration);
      useMapStore.setState({
        camera: { bearing: normalizeAngle(heading), zoom, pitch },
      });
      if (needsTransition) transitionUntil = Date.now() + duration;
      needsTransition = false;
    };
    const unsubscribeMotion = motionEngine.subscribe(update);
    const unsubscribeState = useMapStore.subscribe((state, previous) => {
      if (
        state.mode !== previous.mode ||
        state.recenterRevision !== previous.recenterRevision ||
        state.is3D !== previous.is3D ||
        state.mock !== previous.mock
      ) {
        needsTransition = true;
        transitionUntil = 0;
        heading = state.camera.bearing;
        if (state.mode === "explore") {
          if (state.is3D !== previous.is3D)
            moveCamera(
              { pitch: state.is3D ? CAMERA.followPitch : 0 },
              CAMERA.transitionMs,
            );
        } else {
          update();
          // Leaving Explore straight into Start/Recenter (e.g. tapping Start
          // right after the route-preview `fitToCoordinates` call) can race
          // that still-animating native camera command — whichever one lands
          // last on the native side wins, and it isn't always this one. A
          // delayed follow-up re-asserts the zoomed-in follow camera once the
          // preview animation has certainly finished, so a lucky race can't
          // leave the map stuck zoomed out.
          if (previous.mode === "explore") {
            if (reassertTimer) clearTimeout(reassertTimer);
            reassertTimer = setTimeout(() => {
              reassertTimer = null;
              if (useMapStore.getState().mode !== "explore") {
                needsTransition = true;
                transitionUntil = 0;
                update();
              }
            }, 1200);
          }
        }
      }
      if (state.northRevision !== previous.northRevision) {
        moveCamera({ heading: 0 }, CAMERA.transitionMs);
      }
    });
    update();
    return () => {
      if (reassertTimer) clearTimeout(reassertTimer);
      unsubscribeMotion();
      unsubscribeState();
    };
  }, [mapRef, height, ready, active]);

  const onPanDrag = () => {
    if (useMapStore.getState().mode !== "explore")
      useMapStore.getState().setMode("explore");
  };

  const onRegionChangeComplete = (
    _region: unknown,
    details?: { isGesture?: boolean },
  ) => {
    const isProgrammatic = Date.now() < programmaticUntil.current;
    if (
      !isProgrammatic &&
      details?.isGesture !== false &&
      useMapStore.getState().mode !== "explore"
    ) {
      useMapStore.getState().setMode("explore");
    }
    if (Date.now() - lastTelemetry.current < 300) return;
    lastTelemetry.current = Date.now();
    mapRef.current
      ?.getCamera()
      .then((camera) => {
        useMapStore.setState({
          camera: {
            bearing: normalizeAngle(camera.heading),
            zoom: camera.zoom ?? CAMERA.followZoom,
            pitch: camera.pitch,
          },
        });
      })
      .catch(() => {});
  };

  return { onPanDrag, onRegionChangeComplete };
}
