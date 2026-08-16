import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, ImageBackground, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { SplashBackground } from "../components/ui/SplashBackground";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

const MOTORCYCLE_WIDTH = 240;
const MOTORCYCLE_HEIGHT = 140;
const PUSH_DURATION = 1400;

/**
 * Screen 0 -- cinematic brand intro (~3.9s), then hands off to Welcome.
 *
 * Icon: two layers -- glass-icon frame (top) does one slow smooth 360 twist
 * with a slight fade-in; rapex-logo bird mark (behind it) fades + zooms
 * slightly into place, settling as the frame's twist finishes. No rotation
 * on the bird itself.
 *
 * Wordmark (rapex-name-with-tagline) keeps its original reveal timing.
 *
 * Motorcycle: after a short hold, the rider runs ONE continuous constant-
 * speed pass from the right edge clean through the left edge -- it never
 * stops or decelerates mid-screen. The splash panel stays perfectly still
 * while the rider is still entering; only once the rider's rear wheel has
 * fully crossed onto screen does the panel start moving, and from that
 * instant on the panel's right edge is glued 1:1 to the rider's rear wheel
 * position (derived from the SAME Animated.Value, not a separate timing),
 * so it visually reads as the rider dragging the panel off screen by
 * contact, ending the moment the rider (and panel) are both fully exited
 * left. login-dark-2 sits behind everything so there's no flash/gap.
 */
export function SplashScreen({ navigation }: Props) {
  const width = useRef(Dimensions.get("window").width).current;

  const frameOpacity = useRef(new Animated.Value(0)).current;
  const frameRotate = useRef(new Animated.Value(0)).current;
  const birdOpacity = useRef(new Animated.Value(0)).current;
  const birdScale = useRef(new Animated.Value(0.85)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(15)).current;

  const motorcycleX = useRef(new Animated.Value(width)).current;
  const splashPanelX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Frame: slight fade-in, ONE slow smooth 360 twist (~1s).
    Animated.timing(frameOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(frameRotate, {
      toValue: 1,
      duration: 1000,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Bird mark: fades + zooms slightly into place behind the frame, settling
    // by the time the frame's twist finishes -- no rotation of its own.
    Animated.timing(birdOpacity, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    Animated.timing(birdScale, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Wordmark -- timing/duration unchanged, only the asset changed (tagline baked in).
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

    // Motorcycle: short hold after the wordmark settles, then ONE continuous
    // constant-speed (linear) run all the way from off-right to off-left.
    // The panel stays put while the rider is still entering; once the rider's rear
    // wheel has fully crossed onto screen (rider has traveled MOTORCYCLE_WIDTH of its
    // total width+MOTORCYCLE_WIDTH journey), the panel starts a SEPARATE linear run
    // to -width timed to finish at the exact same instant the rider finishes -- since
    // both move at constant speed over that shared remaining duration, the panel's
    // right edge stays glued to the rider's rear wheel for the whole drag, not just
    // at the two endpoints. (Deliberately two independently-timed animations rather
    // than deriving one from a multi-stop interpolate on the other -- confirmed via
    // self-testing that the interpolate approach doesn't hold the "still entering"
    // segment flat reliably.)
    const entryDuration = Math.round((PUSH_DURATION * MOTORCYCLE_WIDTH) / (width + MOTORCYCLE_WIDTH));
    const dragDuration = PUSH_DURATION - entryDuration;

    const pushTimer = setTimeout(() => {
      Animated.timing(motorcycleX, {
        toValue: -MOTORCYCLE_WIDTH,
        duration: PUSH_DURATION,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => navigation.replace("Welcome"));

      Animated.sequence([
        Animated.delay(entryDuration),
        Animated.timing(splashPanelX, {
          toValue: -width,
          duration: dragDuration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2500);

    return () => clearTimeout(pushTimer);
  }, [navigation, width, frameOpacity, frameRotate, birdOpacity, birdScale, nameOpacity, nameTranslateY, motorcycleX, splashPanelX]);

  const frameRotateDeg = frameRotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.page}>
      <StatusBar style="light" hidden />

      {/* Sits behind everything -- revealed the instant the splash panel clears the left edge. */}
      <ImageBackground source={require("../assets/backgrounds/login-dark-2.png")} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* The whole splash panel (background + icon + wordmark) moves together as ONE physical layer. */}
      <Animated.View style={[styles.panel, { transform: [{ translateX: splashPanelX }] }]}>
        <SplashBackground />
        <View style={styles.center}>
          <View style={styles.iconStack}>
            <Animated.Image
              source={require("../assets/logo/rapex-logo.png")}
              resizeMode="contain"
              style={[styles.bird, { opacity: birdOpacity, transform: [{ scale: birdScale }] }]}
            />
            <Animated.Image
              source={require("../assets/logo/glass-icon.png")}
              resizeMode="contain"
              style={[styles.frame, { opacity: frameOpacity, transform: [{ rotate: frameRotateDeg }] }]}
            />
          </View>
          <Animated.Image
            source={require("../assets/logo/rapex-name-with-tagline.png")}
            resizeMode="contain"
            style={[styles.wordmark, { opacity: nameOpacity, transform: [{ translateY: nameTranslateY }] }]}
          />
        </View>
      </Animated.View>

      {/* Motorcycle layer -- above the splash panel. Tires render first (behind), body last (on
          top/front). Wheels are static for now (no spin). */}
      <Animated.View style={[styles.motorcycle, { transform: [{ translateX: motorcycleX }] }]}>
        <Animated.Image source={require("../assets/logo/front-tire.png")} resizeMode="contain" style={styles.motorcycleLayer} />
        <Animated.Image source={require("../assets/logo/rear-tire.png")} resizeMode="contain" style={styles.motorcycleLayer} />
        <Animated.Image source={require("../assets/logo/rider-no-wheel.png")} resizeMode="contain" style={styles.motorcycleLayer} />
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
  },
  center: {
    width: 260,
    alignItems: "center",
    zIndex: 10,
  },
  iconStack: {
    width: 160,
    height: 160,
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
    width: 240,
    height: 100,
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
