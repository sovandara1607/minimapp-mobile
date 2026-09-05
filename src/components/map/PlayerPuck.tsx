import { memo, useSyncExternalStore } from "react";
import { CustomLocationProvider, Images, LocationPuck } from "@rnmapbox/maps";
import { motionEngine } from "../../services/motionEngine";
const images = {
  "player-arrow": require("../../../assets/player-arrow.png"),
  "player-empty": require("../../../assets/player-empty.png"),
};
/** Only this small provider subscribes at 5 Hz. Mapbox animates its original artwork natively. */
export const PlayerPuck = memo(function PlayerPuck() {
  const frame = useSyncExternalStore(
    motionEngine.subscribe,
    motionEngine.getSnapshot,
  );
  return (
    <>
      <Images images={images} />
      {frame && (
        <CustomLocationProvider
          coordinate={frame.coordinate}
          heading={frame.heading}
        />
      )}
      {frame && (
        <LocationPuck
          bearingImage="player-arrow"
          topImage="player-empty"
          shadowImage="player-empty"
          puckBearing="heading"
          puckBearingEnabled
          scale={0.5}
          pulsing={{ isEnabled: false }}
        />
      )}
    </>
  );
});
