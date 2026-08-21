import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { useTheme } from "./useTheme";

export type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

/**
 * Plain frosted glass: real BlurView behind the content, translucent tint,
 * a thin neutral border, and a soft upper-edge highlight for the light-
 * catch -- no colored gradient glow. That treatment is reserved for
 * RapexGlassCard's `tone="dark"` (see that file), used for specific dark
 * accent surfaces like an online-status bar or a wallet balance card, not
 * the default card used everywhere. `overflow: hidden` is required so the
 * blur and highlight respect the border radius instead of bleeding into
 * square corners.
 */
export function GlassCard({ children, style }: GlassCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: theme.glass.border,
          borderRadius: theme.radius.lg,
          ...theme.shadows.md.native,
        },
        style,
      ]}
    >
      <BlurView intensity={theme.glass.blurIntensity} tint={theme.mode} style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.glass.background }]} />
      <View pointerEvents="none" style={styles.topHighlight} />
      <View style={{ padding: theme.spacing.lg }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
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
