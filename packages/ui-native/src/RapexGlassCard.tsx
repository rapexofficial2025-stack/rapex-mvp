import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "./useTheme";

export type RapexGlassCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  /** Ambient purple/orange glow (shadow) behind the card. Default true. */
  glow?: boolean;
  /**
   * "auto" (default) follows the current light/dark theme, same as before.
   * "dark" forces a black glass surface regardless of app theme -- for
   * specific dark accent surfaces (an online-status bar, a wallet balance
   * card) that read as intentionally-black-glass even inside an otherwise
   * light screen, per the reference designs.
   */
  tone?: "auto" | "dark";
};

/**
 * The reflective-glass card described in the RAPEX design system: blurred
 * translucent surface (expo-blur), gradient reflective border (an outer
 * LinearGradient ring, the native equivalent of the web version's
 * mask-composite border trick), a soft upper-edge highlight, and an
 * optional purple/orange ambient glow. Distinct from the plainer
 * `GlassCard` (no colored border/glow) -- use that one for ordinary cards,
 * this one for the specific surfaces that should carry the glass-brand
 * treatment (see `tone` for forcing the dark variant of it).
 *
 * Requires expo-blur and expo-linear-gradient in the consuming app (both
 * already dependencies of customer-app/rider-app) -- declared as peer
 * dependencies here, same pattern as react-native-maps for RapexMapView.
 */
export function RapexGlassCard({ children, style, glow = true, tone = "auto" }: RapexGlassCardProps) {
  const theme = useTheme();
  const borderRadius = theme.radius.xl;
  const background = tone === "dark" ? "rgba(10, 10, 18, 0.78)" : theme.glass.background;
  const blurTint = tone === "dark" ? "dark" : theme.mode;

  return (
    <View
      style={[
        glow
          ? {
              shadowColor: theme.extended.lavender,
              shadowOpacity: 0.35,
              shadowRadius: 24,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
            }
          : undefined,
        style,
      ]}
    >
      <LinearGradient
        colors={["rgba(139, 92, 246, 0.7)", "rgba(249, 115, 22, 0.5)", "rgba(255, 255, 255, 0.15)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius, padding: 1 }}
      >
        <View style={{ borderRadius: borderRadius - 1, overflow: "hidden" }}>
          <BlurView intensity={theme.glass.blurIntensity} tint={blurTint} style={StyleSheet.absoluteFill} />
          {/* Upper-edge highlight, mirrors the web version's ::after gradient overlay. */}
          <LinearGradient
            colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.6 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View
            style={{
              backgroundColor: background,
              padding: theme.spacing.lg,
            }}
          >
            {children}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
