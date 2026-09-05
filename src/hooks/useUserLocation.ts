import { useCallback, useEffect, useRef, useState } from "react";
import { Linking } from "react-native";
import * as Location from "expo-location";
import { CAMERA } from "../constants/camera";
import { motionEngine } from "../services/motionEngine";
import { permissionStatus, watchLocation } from "../services/locationService";
import { startMockLocation } from "../services/mockLocationService";
import { useMapStore } from "../stores/mapStore";
import { useAppActive } from "./useAppActive";
import { useHeading } from "./useHeading";
import type { LocationFix } from "../types/map";

export function useUserLocation() {
  const active = useAppActive();
  const mock = useMapStore((s) => s.mock);
  const status = useMapStore((s) => s.status);
  const [revision, setRevision] = useState(0);
  const requesting = useRef(false);
  useHeading(active && !mock && status === "granted");

  useEffect(() => {
    if (!active) return;
    let disposed = false;
    let subscription: Location.LocationSubscription | undefined;
    let stopMock: (() => void) | undefined;
    let lastAcceptedAt = Date.now();
    let serviceCheckPending = false;
    motionEngine.reset();
    useMapStore.setState({
      fix: null,
      stale: false,
      headingAvailable: true,
      status: "checking",
    });
    const accept = (fix: LocationFix) => {
      if (
        disposed ||
        Date.now() - fix.timestamp > 15000 ||
        !motionEngine.setFix(fix)
      )
        return;
      lastAcceptedAt = Date.now();
      useMapStore.setState({ fix, stale: false, status: "granted" });
    };
    const tick = setInterval(
      () => motionEngine.tick(Date.now()),
      CAMERA.frameMs,
    );
    const watchdog = setInterval(() => {
      if (mock || disposed) return;
      const stale = Date.now() - lastAcceptedAt > 12000;
      if (stale !== useMapStore.getState().stale)
        useMapStore.setState({ stale });
      if (
        !stale ||
        serviceCheckPending ||
        useMapStore.getState().status !== "granted"
      )
        return;
      serviceCheckPending = true;
      void Location.hasServicesEnabledAsync()
        .then((enabled) => {
          if (!disposed && !enabled)
            useMapStore.setState({ status: "unavailable" });
        })
        .catch(() => {
          if (!disposed) useMapStore.setState({ status: "unavailable" });
        })
        .finally(() => {
          serviceCheckPending = false;
        });
    }, 2000);

    if (mock && __DEV__) {
      useMapStore.setState({ status: "granted" });
      stopMock = startMockLocation(accept);
    } else {
      void (async () => {
        const permission = await Location.getForegroundPermissionsAsync();
        if (disposed) return;
        useMapStore.setState({ status: permissionStatus(permission) });
        if (!permission.granted) return;
        if (!(await Location.hasServicesEnabledAsync())) {
          if (!disposed) useMapStore.setState({ status: "unavailable" });
          return;
        }
        if (disposed) return;
        const sub = await watchLocation(accept, () => {
          if (!disposed) useMapStore.setState({ status: "unavailable" });
        });
        if (disposed) sub.remove();
        else subscription = sub;
      })().catch(() => {
        if (!disposed) useMapStore.setState({ status: "unavailable" });
      });
    }
    return () => {
      disposed = true;
      subscription?.remove();
      stopMock?.();
      clearInterval(tick);
      clearInterval(watchdog);
    };
  }, [active, mock, revision]);

  const requestLocation = useCallback(async () => {
    if (requesting.current) return;
    requesting.current = true;
    try {
      if (useMapStore.getState().status === "restricted") {
        await Linking.openSettings();
        return;
      }
      const permission = await Location.requestForegroundPermissionsAsync();
      useMapStore.setState({ status: permissionStatus(permission) });
      if (permission.granted) setRevision((value) => value + 1);
    } catch {
      useMapStore.setState({ status: "unavailable" });
    } finally {
      requesting.current = false;
    }
  }, []);
  return {
    requestLocation,
    retry: () => setRevision((value) => value + 1),
    active,
  };
}
