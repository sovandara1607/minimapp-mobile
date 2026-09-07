import { useWindowDimensions } from "react-native";

/**
 * Landscape by aspect ratio, not the OS orientation enum — on a split-screen
 * or foldable window `width > height` is what actually determines whether a
 * side-by-side layout fits, regardless of how the device itself is held.
 */
export function useOrientation() {
  const { width, height } = useWindowDimensions();
  return { isLandscape: width > height, width, height };
}
