import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";

/** Animated glow-shape backdrop used behind SplashScreen. */
export function SplashBackground() {
  const drift1 = useRef(new Animated.Value(0)).current;
  const drift2 = useRef(new Animated.Value(0)).current;
  const drift3 = useRef(new Animated.Value(0)).current;
  const drift4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(drift1, { toValue: 1, duration: 6000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(drift2, { toValue: 1, duration: 5500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(drift3, { toValue: 1, duration: 7000, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ).start();
    Animated.loop(
      Animated.timing(drift4, { toValue: 1, duration: 6500, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    ).start();
  }, []);

  const getDriftStyle = (driftValue: Animated.Value, xRange: [number, number], yRange: [number, number]) => ({
    transform: [
      { translateX: driftValue.interpolate({ inputRange: [0, 1], outputRange: xRange }) },
      { translateY: driftValue.interpolate({ inputRange: [0, 1], outputRange: yRange }) },
    ],
  });

  const drift1Style = getDriftStyle(drift1, [-80, 80], [-60, 60]);
  const drift2Style = getDriftStyle(drift2, [60, -60], [40, -40]);
  const drift3Style = getDriftStyle(drift3, [-50, 50], [80, -80]);
  const drift4Style = getDriftStyle(drift4, [70, -70], [-30, 30]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F0420", "#1A0F35", "#2D1B4E", "#3D2563"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View
        style={[
          {
            position: "absolute",
            top: -120,
            left: -80,
            width: 400,
            height: 200,
            borderRadius: 200,
            backgroundColor: "rgba(249, 115, 22, 0.25)",
            shadowColor: "#F97316",
            shadowOpacity: 0.8,
            shadowRadius: 80,
            shadowOffset: { width: 0, height: 0 },
            elevation: 20,
          },
          drift1Style,
        ]}
      >
        <View style={{ flex: 1, borderRadius: 200, overflow: "hidden" }}>
          <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
            <LinearGradient
              colors={["rgba(249, 115, 22, 0.15)", "rgba(249, 115, 22, 0.05)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ flex: 1, borderRadius: 200, borderWidth: 1.5, borderColor: "rgba(249, 115, 22, 0.3)" }}
            />
          </BlurView>
        </View>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
            top: 100,
            right: -100,
            width: 350,
            height: 350,
            borderRadius: 175,
            backgroundColor: "rgba(124, 58, 237, 0.2)",
            shadowColor: "#7C3AED",
            shadowOpacity: 0.7,
            shadowRadius: 70,
            shadowOffset: { width: 0, height: 0 },
            elevation: 18,
          },
          drift2Style,
        ]}
      >
        <BlurView intensity={65} tint="dark" style={{ flex: 1, borderRadius: 175 }}>
          <LinearGradient
            colors={["rgba(124, 58, 237, 0.12)", "rgba(124, 58, 237, 0.04)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 175, borderWidth: 1.5, borderColor: "rgba(124, 58, 237, 0.25)" }}
          />
        </BlurView>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: -100,
            left: -150,
            width: 450,
            height: 250,
            borderRadius: 225,
            backgroundColor: "rgba(249, 115, 22, 0.22)",
            shadowColor: "#F97316",
            shadowOpacity: 0.75,
            shadowRadius: 75,
            shadowOffset: { width: 0, height: 0 },
            elevation: 19,
          },
          drift3Style,
        ]}
      >
        <BlurView intensity={55} tint="dark" style={{ flex: 1, borderRadius: 225 }}>
          <LinearGradient
            colors={["rgba(249, 115, 22, 0.14)", "rgba(249, 115, 22, 0.04)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 225, borderWidth: 1.5, borderColor: "rgba(249, 115, 22, 0.28)" }}
          />
        </BlurView>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: -80,
            right: -120,
            width: 380,
            height: 300,
            borderRadius: 190,
            backgroundColor: "rgba(192, 132, 250, 0.18)",
            shadowColor: "#C084FA",
            shadowOpacity: 0.7,
            shadowRadius: 65,
            shadowOffset: { width: 0, height: 0 },
            elevation: 17,
          },
          drift4Style,
        ]}
      >
        <BlurView intensity={60} tint="dark" style={{ flex: 1, borderRadius: 190 }}>
          <LinearGradient
            colors={["rgba(192, 132, 250, 0.12)", "rgba(192, 132, 250, 0.03)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 190, borderWidth: 1.5, borderColor: "rgba(192, 132, 250, 0.22)" }}
          />
        </BlurView>
      </Animated.View>

      <View
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          marginLeft: -150,
          marginTop: -150,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: "rgba(124, 58, 237, 0.08)",
          shadowColor: "#7C3AED",
          shadowOpacity: 0.4,
          shadowRadius: 50,
          shadowOffset: { width: 0, height: 0 },
          elevation: 10,
          zIndex: -1,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
});
