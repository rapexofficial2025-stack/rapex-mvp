import { BlurView } from "expo-blur";
import { ReactNode } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Real glass depth, translated from a raw CSS reference (backdrop-filter +
 * radial-gradient glows + inset box-shadow -- none of which exist as-is in
 * React Native) into equivalent native techniques:
 *  - backdrop-filter:blur -> BlurView (already had this)
 *  - top light reflection (linear-gradient) -> LinearGradient, direct translation
 *  - the two radial-gradient corner glows -> soft circular Views with their
 *    own LinearGradient fill (RN has no radial-gradient primitive)
 *  - inset box-shadow highlights (top/bottom inner edge light lines) ->
 *    thin absolute-positioned highlight lines, since RN shadows are
 *    outer-only, not inset
 */
export function GlassCard({ children, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />

      {/* Top light reflection band */}
      <LinearGradient
        colors={["rgba(255,255,255,0.42)", "rgba(255,255,255,0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.topReflection}
        pointerEvents="none"
      />

      {/* Corner glows */}
      <View style={styles.glowWhite} pointerEvents="none">
        <LinearGradient colors={["rgba(255,255,255,0.5)", "rgba(255,255,255,0)"]} style={StyleSheet.absoluteFill} />
      </View>
      <View style={styles.glowPurple} pointerEvents="none">
        <LinearGradient colors={["rgba(168,85,247,0.28)", "rgba(168,85,247,0)"]} style={StyleSheet.absoluteFill} />
      </View>

      {/* Inset-highlight edges (RN shadows are outer-only, so these are drawn lines instead) */}
      <View style={styles.edgeTop} pointerEvents="none" />
      <View style={styles.edgeBottom} pointerEvents="none" />

      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 24,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.55)",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  content: { padding: 24 },
  topReflection: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "45%",
  },
  glowWhite: {
    position: "absolute",
    left: -40,
    top: -25,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  glowPurple: {
    position: "absolute",
    right: -50,
    bottom: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  edgeTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  edgeBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
