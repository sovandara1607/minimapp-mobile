import { memo, useSyncExternalStore } from "react";
import { Marker } from "react-native-maps";
import { motionEngine } from "../../services/motionEngine";

const puckImage = require("../../../assets/player-arrow.png") as number;

/**
 * Only this small marker subscribes at 5 Hz. The motion engine has already
 * smoothed the coordinate and turn-rate-limited the heading (see
 * motionEngine.ts), so a plain native marker update at that rate reads as
 * fluid motion — no extra JS-side animation loop needed.
 *
 * `flat` + `rotation` rotates the icon in world space (native, no JS bridge
 * cost), matching how the camera's own heading is applied — the two cancel
 * out visually so the arrow points "up" whenever the camera also faces the
 * user's heading, and counter-rotates correctly if the user spins the map
 * manually in Explore mode.
 */
export const PlayerPuck = memo(function PlayerPuck() {
  const frame = useSyncExternalStore(
    motionEngine.subscribe,
    motionEngine.getSnapshot,
  );
  if (!frame) return null;
  const [longitude, latitude] = frame.coordinate;
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
      rotation={frame.heading}
      image={puckImage}
      tracksViewChanges={false}
    />
  );
});
