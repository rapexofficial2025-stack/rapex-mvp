import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "./useTheme";

export type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

/**
 * Real frosted-glass look: an actual BlurView behind the content (not just a
 * translucent color standing in for one), a thin gradient reflective border
 * ring (the glowing purple/orange edge that reads as "glass" in reference
 * material -- same technique as RapexGlassCard, just a lighter/subtler glow
 * since this is the app-wide default card, not an opt-in hero treatment),
 * and a soft upper-edge highlight for the light-catch. The outer shadow
 * lives on the un-clipped wrapper (not the overflow:hidden inner view) --
 * clipping and native shadows/elevation don't mix, the shadow would just
 * get cut off.
 */
export function GlassCard({ children, style }: GlassCardProps) {
  const theme = useTheme();
  const borderRadius = theme.radius.lg;

  return (
    <View style={[{ ...theme.shadows.md.native }, style]}>
      <LinearGradient
        colors={["rgba(139, 92, 246, 0.45)", "rgba(249, 115, 22, 0.35)", "rgba(255, 255, 255, 0.12)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius, padding: 1 }}
      >
        <View style={[styles.inner, { borderRadius: borderRadius - 1 }]}>
          <BlurView intensity={theme.glass.blurIntensity} tint={theme.mode} style={StyleSheet.absoluteFill} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.glass.background }]} />
          <View pointerEvents="none" style={styles.topHighlight} />
          <View style={{ padding: theme.spacing.lg }}>{children}</View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    overflow: "hidden",
  },
  topHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
  },
});
