import { useEffect, useRef } from "react";
import { Animated, StyleSheet, type DimensionValue } from "react-native";
import { useTheme } from "./useTheme";

export type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
};

export function Skeleton({ width = "100%", height = 16, radius }: SkeletonProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.block,
        {
          width,
          height,
          borderRadius: radius ?? theme.radius.sm,
          backgroundColor: theme.colors.surfaceAlt,
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {},
});
