import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

type GlowShapeConfig = {
  size: number;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  colors: [string, string];
  borderColor: string;
  driftX: [number, number];
  driftY: [number, number];
  duration: number;
};

// Soft, slow-drifting glass circles -- no shadow/elevation (Android's `elevation`
// only renders a hard, dark, boxy shadow, not a soft colored glow like iOS
// shadows -- that was producing the ugly black square edge). Transparency +
// blur do all the "glow" work instead, which reads as actual glass on both
// platforms.
const SHAPES: GlowShapeConfig[] = [
  {
    size: 320,
    top: -90,
    left: -70,
    colors: ["rgba(249,115,22,0.14)", "rgba(249,115,22,0.02)"],
    borderColor: "rgba(249,115,22,0.20)",
    driftX: [-24, 24],
    driftY: [-16, 16],
    duration: 15000,
  },
  {
    size: 300,
    top: 120,
    right: -90,
    colors: ["rgba(124,58,237,0.13)", "rgba(124,58,237,0.02)"],
    borderColor: "rgba(124,58,237,0.18)",
    driftX: [18, -18],
    driftY: [14, -14],
    duration: 13500,
  },
  {
    size: 340,
    bottom: -100,
    left: -120,
    colors: ["rgba(249,115,22,0.12)", "rgba(249,115,22,0.02)"],
    borderColor: "rgba(249,115,22,0.18)",
    driftX: [-18, 18],
    driftY: [22, -22],
    duration: 17000,
  },
  {
    size: 300,
    bottom: -70,
    right: -100,
    colors: ["rgba(192,132,250,0.11)", "rgba(192,132,250,0.02)"],
    borderColor: "rgba(192,132,250,0.16)",
    driftX: [22, -22],
    driftY: [-10, 10],
    duration: 14500,
  },
];

function GlowShape({ config }: { config: GlowShapeConfig }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [config.duration, drift]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          top: config.top,
          bottom: config.bottom,
          left: config.left,
          right: config.right,
          overflow: "hidden",
        },
        {
          transform: [
            { translateX: drift.interpolate({ inputRange: [0, 1], outputRange: config.driftX }) },
            { translateY: drift.interpolate({ inputRange: [0, 1], outputRange: config.driftY }) },
          ],
        },
      ]}
    >
      <BlurView intensity={85} tint="dark" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={config.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: config.size / 2, borderWidth: 1, borderColor: config.borderColor },
          ]}
        />
      </BlurView>
    </Animated.View>
  );
}

/** Subtle drifting glass shapes behind SplashScreen. */
export function SplashBackground() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F0420", "#1A0F35", "#2D1B4E", "#3D2563"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {SHAPES.map((shape, i) => (
        <GlowShape key={i} config={shape} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
});
