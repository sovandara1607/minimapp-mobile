import { useEffect, useRef } from "react";
import { Camera } from "@rnmapbox/maps";
import { CAMERA, cameraPadding, speedZoom } from "../constants/camera";
import { motionEngine } from "../services/motionEngine";
import { useMapStore } from "../stores/mapStore";
import { angleDelta } from "../utils/geo";

export function useNavigationCamera(
  height: number,
  ready: boolean,
  active: boolean,
) {
  const camera = useRef<Camera>(null);
  useEffect(() => {
    if (!ready || !height || !active) return;
    let transitionUntil = 0;
    let needsTransition = true;
    let heading: number | null = null;
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
      const duration = needsTransition ? CAMERA.transitionMs : CAMERA.frameMs;
      camera.current?.setCamera({
        centerCoordinate: frame.coordinate,
        heading,
        zoomLevel: state.mock ? speedZoom(frame.speed) : CAMERA.followZoom,
        pitch: state.is3D
          ? state.mock
            ? CAMERA.simulationPitch
            : CAMERA.followPitch
          : 0,
        padding: cameraPadding(height),
        animationDuration: duration,
        animationMode: needsTransition ? "easeTo" : "linearTo",
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
            camera.current?.setCamera({
              pitch: state.is3D ? CAMERA.followPitch : 0,
              animationDuration: CAMERA.transitionMs,
              animationMode: "easeTo",
            });
        } else update();
      }
      if (state.northRevision !== previous.northRevision) {
        camera.current?.setCamera({
          heading: 0,
          animationDuration: CAMERA.transitionMs,
          animationMode: "easeTo",
        });
      }
    });
    update();
    return () => {
      unsubscribeMotion();
      unsubscribeState();
    };
  }, [height, ready, active]);
  return camera;
}
