import { Pressable, type GestureResponderEvent } from "react-native";

export type HotspotProps = {
  /** Position/size as a percentage (0-100) of the containing surface -- not pixels. This
   * lets a hit area be described relative to reference artwork of unknown/variable pixel
   * dimensions, and be repositioned by editing four numbers once real assets are aligned. */
  topPct: number;
  leftPct: number;
  widthPct: number;
  heightPct: number;
  /** Required: an invisible control must still be independently reachable/labeled for
   * screen readers and automated testing -- never a silent tap target. */
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  testID?: string;
};

/**
 * Fully transparent, percentage-positioned touch target meant to sit above reference
 * artwork rendered as a background image, so the artwork itself never needs to be
 * recreated or approximated in code -- only the tappable region over it is code.
 */
export function Hotspot({ topPct, leftPct, widthPct, heightPct, label, onPress, disabled, testID }: HotspotProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={{
        position: "absolute",
        top: `${topPct}%`,
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        height: `${heightPct}%`,
      }}
    />
  );
}
