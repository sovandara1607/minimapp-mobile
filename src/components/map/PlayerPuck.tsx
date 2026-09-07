import { memo, useSyncExternalStore } from "react";
import { Marker } from "react-native-maps";
import { motionEngine } from "../../services/motionEngine";

const puckImage = require("../../../assets/player-arrow.png") as number;

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
