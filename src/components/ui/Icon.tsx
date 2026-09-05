import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "../../constants/theme";
type Name =
  | "arrow"
  | "locate"
  | "layers"
  | "pause"
  | "play"
  | "signal"
  | "close"
  | "settings"
  | "search";
const paths: Record<Name, string> = {
  arrow: "M12 3 4 21l8-5 8 5-8-18Z",
  locate: "M12 2v4m0 12v4M2 12h4m12 0h4",
  layers: "m3 9 9-6 9 6-9 6-9-6Zm0 5 9 6 9-6",
  pause: "M9 5v14M15 5v14",
  play: "m8 4 12 8-12 8V4Z",
  signal: "M4 18v2m5-7v7m5-12v12m5-17v17",
  close: "m6 6 12 12M18 6 6 18",
  settings: "M4 7h16M4 17h16M8 4v6m8 4v6",
  search: "m21 21-4.35-4.35",
};
export function Icon({
  name,
  size = 22,
  color = colors.ink,
}: {
  name: Name;
  size?: number;
  color?: string;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d={paths[name]} />
      {name === "locate" && <Circle cx={12} cy={12} r={5} />}
      {name === "search" && <Circle cx={10} cy={10} r={7} />}
    </Svg>
  );
}
