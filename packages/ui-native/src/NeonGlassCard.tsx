import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export type NeonGlassCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  borderRadius?: number;
};

/**
 * Matte-black login-card treatment, built entirely in code (no background
 * image asset needed): a saturated orange-to-purple neon gradient ring for
 * the border, a dark-gray-to-black gradient fill (a linear approximation of
 * a "round"/radial gradient -- React Native has no built-in radial gradient
 * primitive), and a soft white glow shadow positioned above the card so it
 * reads as floating rather than resting flat on the background.
 *
 * Self-contained and theme-independent (always matte black, not
 * light/dark-mode aware) -- distinct from RapexGlassCard, which follows the
 * app theme, uses a blurred translucent fill, and a softer/lower shadow.
 */
export function NeonGlassCard({ children, style, borderRadius = 28 }: NeonGlassCardProps) {
  return (
    <View
      style={[
        {
          shadowColor: "#FFFFFF",
          shadowOpacity: 0.16,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: -14 },
          elevation: 14,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={["#FB923C", "#C084FC", "#7C3AED"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius, padding: 1.5 }}
      >
        <LinearGradient
          colors={["#3A3A40", "#0A0A0C"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ borderRadius: borderRadius - 1.5, overflow: "hidden" }}
        >
          <View style={{ padding: 24 }}>{children}</View>
        </LinearGradient>
      </LinearGradient>
    </View>
  );
}
