import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { SplashBackground } from "../components/ui/SplashBackground";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

/**
 * Screen 0 -- brand mark intro animation (~3s), then hands off to Welcome.
 * Two-layer icon: the glass frame (on top) does a single slow 360 twist
 * with a slight fade-in; the bird mark (rapex-logo, behind the frame)
 * fades + zooms into place at the same time, settling right as the frame
 * finishes twisting. Wordmark (rapex-name-with-tagline) reveal keeps its
 * original timing/duration, just swapped to the tagline asset. The REX
 * mp4 does NOT play here -- that's still at the end of the SignUp flow
 * (see WelcomeVideoScreen). Visual only, no backend call.
 */
export function SplashScreen({ navigation }: Props) {
  const frameOpacity = useRef(new Animated.Value(0)).current;
  const frameRotate = useRef(new Animated.Value(0)).current;
  const birdOpacity = useRef(new Animated.Value(0)).current;
  const birdScale = useRef(new Animated.Value(0.85)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(15)).current;

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

    const timer = setTimeout(() => navigation.replace("Welcome"), 3000);
    return () => clearTimeout(timer);
  }, [navigation]);

  const frameRotateDeg = frameRotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View style={styles.page}>
      <StatusBar style="light" hidden />
      <SplashBackground />
      <View style={styles.center}>
        <View style={styles.iconStack}>
          {/* Bird mark -- behind the frame, fades/zooms into place, does not rotate. */}
          <Animated.Image
            source={require("../assets/logo/rapex-logo.png")}
            resizeMode="contain"
            style={[styles.bird, { opacity: birdOpacity, transform: [{ scale: birdScale }] }]}
          />
          {/* Glass frame -- on top, single slow 360 twist. */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
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
});
