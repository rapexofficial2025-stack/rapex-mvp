import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { SplashBackground } from "../components/ui/SplashBackground";
import { WelcomeScreen } from "./WelcomeScreen";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

const MOTORCYCLE_WIDTH = 240;
const MOTORCYCLE_HEIGHT = 140;
const PUSH_DURATION = 800;

/**
 * Splash is now an animated overlay over the Welcome screen.
 *
 * IMPORTANT:
 * Welcome is rendered FIRST underneath this screen.
 * The motorcycle pushes only the Splash panel away.
 * There is NO navigation handoff after the push.
 *
 * This prevents the purple/blank frame that appeared between
 * Splash and Welcome.
 */
export function SplashScreen({ navigation }: Props) {
  const width = useRef(Dimensions.get("window").width).current;

  const frameOpacity = useRef(new Animated.Value(0)).current;
  const frameRotate = useRef(new Animated.Value(0.50)).current;
  const birdOpacity = useRef(new Animated.Value(0)).current;
  const birdScale = useRef(new Animated.Value(0.95)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(15)).current;

  const sparkPulse = useRef(new Animated.Value(0)).current;

  const motorcycleX = useRef(new Animated.Value(width)).current;

  const splashPanelX = motorcycleX.interpolate({
    inputRange: [-MOTORCYCLE_WIDTH, width],
    outputRange: [-MOTORCYCLE_WIDTH - width, 0],
  });

  useEffect(() => {
    // Frame: slight fade-in, ONE slow smooth 360 twist.
    Animated.timing(frameOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // TWIST — slower
Animated.timing(frameRotate, {
  toValue: 1,
  duration: 2000,
  easing: Easing.inOut(Easing.cubic),
  useNativeDriver: true,
}).start();

    // Bird mark: WAIT until the 360° twist finishes,
// then wait another 300ms before appearing.
Animated.timing(birdOpacity, {
  toValue: 1,
  duration: 1000,
  delay: 1500,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
}).start();

Animated.timing(birdScale, {
  toValue: 1,
  duration: 1000,
  delay: 1500,
  easing: Easing.out(Easing.cubic),
  useNativeDriver: true,
}).start();

    // Wordmark timing stays unchanged.
    Animated.timing(nameOpacity, {
      toValue: 1,
      duration: 700,
      delay: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(nameTranslateY, {
      toValue: 0,
      duration: 700,
      delay: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Motorcycle: ONE continuous push.
    const pushTimer = setTimeout(() => {
      Animated.timing(motorcycleX, {
        toValue: -MOTORCYCLE_WIDTH,
        duration: PUSH_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start();

      // Spark glow during the push.
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkPulse, {
            toValue: 1,
            duration: 90,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(sparkPulse, {
            toValue: 0.4,
            duration: 110,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 2500);

    return () => clearTimeout(pushTimer);
  }, [
    width,
    frameOpacity,
    frameRotate,
    birdOpacity,
    birdScale,
    nameOpacity,
    nameTranslateY,
    motorcycleX,
    sparkPulse,
  ]);

  const frameRotateDeg = frameRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.page}>
      <StatusBar style="light" hidden />

      {/* =========================================================
          WELCOME IS ALREADY RENDERED UNDERNEATH THE SPLASH
          ========================================================= */}
      <View style={StyleSheet.absoluteFill}>
        <WelcomeScreen
          navigation={navigation as any}
          route={
            {
              key: "Welcome",
              name: "Welcome",
            } as any
          }
        />
      </View>

      {/* =========================================================
          SPLASH PANEL
          THIS IS THE ONLY THING THE MOTORCYCLE PUSHES AWAY
          ========================================================= */}
      <Animated.View
        style={[
          styles.panel,
          {
            transform: [{ translateX: splashPanelX }],
          },
        ]}
      >
        <SplashBackground />

        <View style={styles.center}>
          <View style={styles.iconStack}>
            <Animated.Image
              source={require("../assets/logo/rapex-logo.png")}
              resizeMode="contain"
              style={[
                styles.bird,
                {
                  opacity: birdOpacity,
                  transform: [{ scale: birdScale }],
                },
              ]}
            />

            <Animated.Image
              source={require("../assets/logo/glass-icon.png")}
              resizeMode="contain"
              style={[
                styles.frame,
                {
                  opacity: frameOpacity,
                  transform: [{ rotate: frameRotateDeg }],
                },
              ]}
            />
          </View>

          <Animated.Image
            source={require("../assets/logo/rapex-name-with-tagline.png")}
            resizeMode="contain"
            style={[
              styles.wordmark,
              {
                opacity: nameOpacity,
                transform: [{ translateY: nameTranslateY }],
              },
            ]}
          />
        </View>

        {/* Spark at panel edge */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sparkWrap,
            {
              opacity: sparkPulse,
              transform: [
                {
                  scaleX: sparkPulse.interpolate({
                    inputRange: [0.4, 1],
                    outputRange: [0.7, 1.3],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[
              "rgba(249,115,22,0)",
              "rgba(249,115,22,0.9)",
              "rgba(139,92,246,0.9)",
              "rgba(139,92,246,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Animated.View>

      {/* =========================================================
          MOTORCYCLE
          ========================================================= */}
      <Animated.View
        style={[
          styles.motorcycle,
          {
            transform: [{ translateX: motorcycleX }],
          },
        ]}
      >
        <Animated.Image
          source={require("../assets/logo/front-tire.png")}
          resizeMode="contain"
          style={styles.motorcycleLayer}
        />

        <Animated.Image
          source={require("../assets/logo/rear-tire.png")}
          resizeMode="contain"
          style={styles.motorcycleLayer}
        />

        <Animated.Image
          source={require("../assets/logo/rider-no-wheel.png")}
          resizeMode="contain"
          style={styles.motorcycleLayer}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#1A103D",
    overflow: "hidden",
  },

  panel: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#1A103D",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },

  center: {
    width: 260,
    alignItems: "center",
    zIndex: 10,
  },

  sparkWrap: {
    position: "absolute",
    right: -16,
    top: 0,
    bottom: 0,
    width: 32,
    zIndex: 15,
  },

  iconStack: {
    width: 170,
    height: 170,
  },

  bird: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },

  frame: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },

  wordmark: {
    width: 280,
    height: 135,
    marginTop: 18,
  },

  motorcycle: {
    position: "absolute",
    left: 0,
    bottom: 70,
    width: MOTORCYCLE_WIDTH,
    height: MOTORCYCLE_HEIGHT,
    zIndex: 20,
  },

  motorcycleLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
});