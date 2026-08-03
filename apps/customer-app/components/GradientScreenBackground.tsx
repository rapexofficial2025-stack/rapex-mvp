import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * Procedural white + purple/orange glass-shape backdrop -- stands in for the
 * real background art (Glide reference: white base, soft purple/orange glow,
 * scattered irregular translucent glass shapes) until those PNGs are dropped
 * into assets/brand or assets/images and wired in directly.
 */
export function GradientScreenBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#FFFFFF" }]} />

      {/* Soft center-top glow */}
      <LinearGradient
        colors={["rgba(168,85,247,0.14)", "rgba(255,255,255,0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Orange accent, top-right */}
      <LinearGradient
        colors={["rgba(249,115,22,0.16)", "rgba(249,115,22,0)"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.55, y: 0.35 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Purple wash, bottom */}
      <LinearGradient
        colors={["rgba(124,58,237,0)", "rgba(124,58,237,0.08)"]}
        start={{ x: 0.5, y: 0.7 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Blob top={-30} left={-40} size={130} rotate="18deg" color="rgba(168,85,247,0.10)" />
      <Blob top={90} right={-50} size={150} rotate="-12deg" color="rgba(249,115,22,0.12)" />
      <Blob bottom={140} left={-45} size={110} rotate="25deg" color="rgba(192,132,252,0.10)" />
      <Blob bottom={-35} right={-30} size={140} rotate="-8deg" color="rgba(124,58,237,0.09)" />
    </View>
  );
}

type BlobProps = {
  size: number;
  color: string;
  rotate: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

/** An intentionally-irregular "glass" blob -- mismatched corner radii + rotation, not a perfect circle. */
function Blob({ size, color, rotate, top, bottom, left, right }: BlobProps) {
  return (
    <View
      style={{
        position: "absolute",
        top,
        bottom,
        left,
        right,
        width: size,
        height: size,
        backgroundColor: color,
        borderTopLeftRadius: size * 0.5,
        borderTopRightRadius: size * 0.35,
        borderBottomRightRadius: size * 0.55,
        borderBottomLeftRadius: size * 0.3,
        transform: [{ rotate }],
      }}
    />
  );
}
