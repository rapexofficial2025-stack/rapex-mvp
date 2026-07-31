import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "./useTheme";

export type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

/**
 * Approximates the glass/frosted look with translucent background + border
 * (no BlurView dependency yet -- swap in expo-blur behind this same API
 * later without touching call sites, if a true blur is needed).
 */
export function GlassCard({ children, style }: GlassCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.glass.background,
          borderColor: theme.glass.border,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          ...theme.shadows.md.native,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
  },
});
