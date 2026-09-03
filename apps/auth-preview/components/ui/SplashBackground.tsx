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
  maxOpacity: number;
  fadeInDelay: number;
};

// Soft, slow-drifting glass bubbles -- no shadow/elevation (Android's `elevation`
// only renders a hard, dark, boxy shadow, not a soft colored glow like iOS
// shadows -- that was producing the ugly black square edge). Transparency +
// blur do all the "glow" work instead, which reads as actual glass on both
// platforms. 1 big + 2 medium + 2 small, each fading in on its own delay and
// drifting at its own random pace so they never feel synced/mechanical.
// Colors bumped ~5% more vibrant than the original flat/"dead" version.
const SHAPES: GlowShapeConfig[] = [
  {
    size: 380,
    top: -100,
    left: -90,
    colors: ["rgba(124,58,237,0.19)", "rgba(124,58,237,0.02)"],
    borderColor: "rgba(124,58,237,0.24)",
    driftX: [-26, 22],
    driftY: [-14, 18],
    duration: 19000,
    maxOpacity: 0.4,
    fadeInDelay: 0,
  },
  {
    size: 250,
    top: 130,
    right: -80,
    colors: ["rgba(249,115,22,0.19)", "rgba(249,115,22,0.02)"],
    borderColor: "rgba(249,115,22,0.25)",
    driftX: [16, -20],
    driftY: [12, -16],
    duration: 15200,
    maxOpacity: 0.4,
    fadeInDelay: 400,
  },
  {
    size: 250,
    bottom: -80,
    left: -100,
    colors: ["rgba(192,132,250,0.17)", "rgba(192,132,250,0.02)"],
    borderColor: "rgba(192,132,250,0.22)",
    driftX: [-20, 18],
    driftY: [20, -18],
    duration: 16600,
    maxOpacity: 0.4,
    fadeInDelay: 900,
  },
  {
    size: 160,
    top: 60,
    right: 30,
    colors: ["rgba(249,115,22,0.18)", "rgba(249,115,22,0.02)"],
    borderColor: "rgba(249,115,22,0.23)",
    driftX: [10, -14],
    driftY: [-18, 12],
    duration: 11400,
    maxOpacity: 0.4,
    fadeInDelay: 1300,
  },
  {
    size: 160,
    bottom: 40,
    right: -40,
    colors: ["rgba(124,58,237,0.18)", "rgba(124,58,237,0.02)"],
    borderColor: "rgba(124,58,237,0.23)",
    driftX: [-12, 16],
    driftY: [14, -10],
    duration: 12800,
    maxOpacity: 0.4,
    fadeInDelay: 1800,
  },
];

function GlowShape({ config }: { config: GlowShapeConfig }) {
  const drift = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

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

    const fade = Animated.timing(fadeIn, {
      toValue: config.maxOpacity,
      duration: 1800,
      delay: config.fadeInDelay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    fade.start();

    return () => {
      loop.stop();
      fade.stop();
    };
  }, [config.duration, config.fadeInDelay, config.maxOpacity, drift, fadeIn]);

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
          opacity: fadeIn,
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

/** Subtle drifting glass bubbles behind SplashScreen -- 1 big, 2 medium, 2 small, each fading in and drifting on its own random-feeling pace. */
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
