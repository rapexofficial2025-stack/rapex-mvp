import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { SplashBackground } from "../components/ui/SplashBackground";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

type Phase = "logo" | "rex" | "blackout";

// Placeholder -- structure/flow only. Drop the real file in at this path
// and it resolves automatically, no code change needed.
const REX_VIDEO = require("../assets/videos/rex-intro.mp4");

/**
 * Screen 0 -- three phases, then hands off to Welcome:
 *  1. "logo"     brand mark intro animation (~3s)
 *  2. "rex"      R.E.X. mascot mp4 plays once, full screen
 *  3. "blackout" screen fades to black, then navigates
 * Visual only -- no backend call anywhere in this screen.
 */
export function SplashScreen({ navigation }: Props) {
  const [phase, setPhase] = useState<Phase>("logo");

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const nameOpacity = useRef(new Animated.Value(0)).current;
  const nameTranslateY = useRef(new Animated.Value(15)).current;
  const blackoutOpacity = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(REX_VIDEO, (p) => {
    p.loop = false;
  });

  // Phase 1: logo intro, then move to the REX video.
  useEffect(() => {
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    Animated.timing(logoScale, {
      toValue: 1,
      duration: 1400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    Animated.timing(nameOpacity, {
      toValue: 1,
      duration: 900,
      delay: 1800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
    Animated.timing(nameTranslateY, {
      toValue: 0,
      duration: 900,
      delay: 1800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => setPhase("rex"), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Phase 2: play the REX mp4 once, move to blackout when it finishes.
  useEffect(() => {
    if (phase !== "rex") return;
    player.play();
    const subscription = player.addListener("playToEnd", () => setPhase("blackout"));
    return () => subscription.remove();
  }, [phase, player]);

  // Phase 3: fade to black, then hand off to Welcome.
  useEffect(() => {
    if (phase !== "blackout") return;
    Animated.timing(blackoutOpacity, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => navigation.replace("Welcome"));
  }, [phase, navigation]);

  return (
    <View style={styles.page}>
      <StatusBar style="light" hidden />

      {phase === "logo" ? (
        <>
          <SplashBackground />
          <View style={styles.center}>
            <Animated.Image
              source={require("../assets/logo/glass-icon.png")}
              resizeMode="contain"
              style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
            />
            <Animated.Image
              source={require("../assets/logo/rapex-name-only.png")}
              resizeMode="contain"
              style={[styles.wordmark, { opacity: nameOpacity, transform: [{ translateY: nameTranslateY }] }]}
            />
          </View>
        </>
      ) : (
        <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />
      )}

      {phase === "blackout" ? (
        <Animated.View pointerEvents="none" style={[styles.blackoutOverlay, { opacity: blackoutOpacity }]} />
      ) : null}
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
  logo: {
    width: 160,
    height: 160,
  },
  wordmark: {
    width: 220,
    height: 90,
    marginTop: 18,
  },
  video: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
  blackoutOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#000000",
  },
});
