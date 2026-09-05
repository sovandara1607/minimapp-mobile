import { Camera } from "@rnmapbox/maps";
import { useNavigationCamera } from "../../hooks/useNavigationCamera";
import { CAMERA, cameraPadding } from "../../constants/camera";
import { MOCK_ROUTE } from "../../constants/mockRoute";
const initialSettings = {
  centerCoordinate: MOCK_ROUTE[0],
  zoomLevel: CAMERA.followZoom,
  pitch: CAMERA.followPitch,
};
export function NavigationCamera({
  height,
  ready,
  active,
}: {
  height: number;
  ready: boolean;
  active: boolean;
}) {
  const camera = useNavigationCamera(height, ready, active);
  return (
    <Camera
      ref={camera}
      defaultSettings={{ ...initialSettings, padding: cameraPadding(height) }}
      minZoomLevel={CAMERA.minZoom}
      maxZoomLevel={CAMERA.maxZoom}
      allowUpdates={active}
    />
  );
}
