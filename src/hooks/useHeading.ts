import { useEffect } from "react";
import * as Location from "expo-location";
import { motionEngine } from "../services/motionEngine";
import { useMapStore } from "../stores/mapStore";
export function useHeading(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    let subscription: Location.LocationSubscription | undefined;
    void Location.watchHeadingAsync(
      (event) => {
        if (disposed) return;
        const valid =
          event.accuracy > 0 &&
          (event.trueHeading >= 0 || event.magHeading >= 0);
        if (useMapStore.getState().headingAvailable !== valid)
          useMapStore.setState({ headingAvailable: valid });
        if (valid)
          motionEngine.setHeading(
            event.trueHeading >= 0 ? event.trueHeading : event.magHeading,
          );
      },
      () => {
        if (!disposed) useMapStore.setState({ headingAvailable: false });
      },
    )
      .then((sub) => {
        if (disposed) sub.remove();
        else subscription = sub;
      })
      .catch(() => {
        if (!disposed) useMapStore.setState({ headingAvailable: false });
      });
    return () => {
      disposed = true;
      subscription?.remove();
    };
  }, [enabled]);
}
