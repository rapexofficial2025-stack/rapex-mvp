import { useEffect, useRef } from "react";
import { Animated, Dimensions, Easing, ImageBackground, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { SplashBackground } from "../components/ui/SplashBackground";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

const MOTORCYCLE_WIDTH = 240;
const MOTORCYCLE_HEIGHT = 140;
const TIRE_SIZE = 54;

/**
 * Screen 0 -- cinematic brand intro (~3.6s), then hands off to Welcome.
 * Sequence: one clean 360 icon rotation -> wordmark reveal -> short hold ->
 * motorcycle enters from the right and PUSHES the whole splash panel off
 * the left edge, wheels spinning only while it moves -> Welcome underneath
 * (login-dark-2 sits behind everything so there's no flash/gap the instant
 * the panel clears). The REX mp4 does NOT play here -- that's still at the
 * end of the SignUp flow (see WelcomeVideoScreen). Visual only, no backend
 * call.
 */
export function SplashScreen({ navigation }: Props) {
  // Snapshot once at mount via Dimensions.get -- NOT the useWindowDimensions hook, which
  // re-renders (and was re-firing this whole effect mid-animation, restarting it) whenever
  // Android settles its layout/insets shortly after the screen mounts.
  const width = useRef(Dimensions.get("window").width).current;

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(15)).current;

  const motorcycleX = useRef(new Animated.Value(width)).current;
  const splashPanelX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const contactX = width * 0.35;

    const sequence = Animated.sequence([
      // Phase 1 (0 - 1.2s): icon fades/scales in with exactly ONE smooth 360 rotation.
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoScale, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      ]),
      // Phase 2 (1.2 - 2.0s): wordmark reveal.
      Animated.parallel([
        Animated.timing(nameOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(nameTranslateY, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // Phase 3 (2.0 - 2.5s): short hold, branding fully visible, nothing moves.
      Animated.delay(500),
      // Phase 4 (2.5 - 2.85s): motorcycle enters from the right toward contact point.
      Animated.timing(motorcycleX, { toValue: contactX, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      // Phase 5 (2.85 - 3.6s): motorcycle pushes the whole splash panel off the left edge.
      Animated.parallel([
        Animated.timing(motorcycleX, { toValue: -MOTORCYCLE_WIDTH, duration: 750, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(splashPanelX, { toValue: -width, duration: 750, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]),
    ]);

    sequence.start(() => navigation.replace("Welcome"));

    return () => {
      sequence.stop();
    };
    // Intentionally mount-only -- width is a fixed snapshot (see above) and the Animated.Value
    // refs are stable across renders, so re-running this on every render would restart the
    // whole cinematic sequence from scratch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const logoRotateDeg = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.page}>
      <StatusBar style="light" hidden />

      {/* Sits behind everything -- revealed the instant the splash panel clears the left edge, so there's no flash/gap before Welcome mounts. */}
      <ImageBackground source={require("../assets/backgrounds/login-dark-2.png")} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* The whole splash panel (background + icon + wordmark) moves together as ONE physical layer. */}
      <Animated.View style={[styles.panel, { transform: [{ translateX: splashPanelX }] }]}>
        <ImageBackground source={require("../assets/backgrounds/login-dark-1.png")} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <SplashBackground />
        <View style={styles.center}>
          <Animated.Image
            source={require("../assets/logo/glass-icon.png")}
            resizeMode="contain"
            style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }, { rotate: logoRotateDeg }] }]}
          />
          <Animated.Image
            source={require("../assets/logo/rapex-name-only.png")}
            resizeMode="contain"
            style={[styles.wordmark, { opacity: nameOpacity, transform: [{ translateY: nameTranslateY }] }]}
          />
        </View>
      </Animated.View>

      {/* Motorcycle layer -- above the splash panel so it visibly overlaps/contacts it during the push.
          Tires render FIRST so they sit BEHIND the body/fenders (rendered last), matching how a
          real motorcycle's wheels are partly covered by the frame. Wheels are static for now (no
          spin) to keep this simple while we confirm the core push/timing works. */}
      <Animated.View style={[styles.motorcycle, { transform: [{ translateX: motorcycleX }] }]}>
        <Animated.Image
          source={require("../assets/logo/front tire.png")}
          resizeMode="contain"
          style={[styles.tire, styles.frontTire]}
        />
        <Animated.Image
          source={require("../assets/logo/rear tire.png")}
          resizeMode="contain"
          style={[styles.tire, styles.rearTire]}
        />
        <Animated.Image
          source={require("../assets/logo/rider no wheel.png")}
          resizeMode="contain"
          style={styles.motorcycleBody}
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
  },
  center: {
    width: 260,
    alignItems: "center",
    zIndex: 10,
  },
  logo: {
    width: 160,
    height: 160,
  },
  wordmark: {
    width: 220,
    height: 90,
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
  motorcycleBody: {
    width: "100%",
    height: "100%",
  },
  tire: {
    position: "absolute",
    width: TIRE_SIZE,
    height: TIRE_SIZE,
    bottom: 6,
  },
  // Motorcycle faces LEFT (it's pushing the panel that direction) -- front wheel leads on the left,
  // rear wheel trails on the right. Nudge these two offsets once testing against the real
  // "rider no wheel" artwork's actual wheel-well positions.
  frontTire: {
    left: 18,
  },
  rearTire: {
    right: 18,
  },
});
