import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { GradientButton } from "../components/buttons/GradientButton";
import { useSignUpFirstName, useSignUpWelcomeGreeting } from "../services/signUpDraftStore";

type Props = NativeStackScreenProps<AuthStackParamList, "WelcomeVideo">;

// Placeholder -- structure/flow only. Drop the real file in at this path
// and it resolves automatically, no code change needed.
const REX_VIDEO = require("../assets/videos/rex-intro.mp4");

/**
 * Timing ported from the real apps/customer-app WelcomeVideoScreen (same
 * welcome.mp4 file, copied here as rex-intro.mp4 -- see that screen's doc
 * comment for how these numbers were measured off the actual video).
 * REX is fully visible and holding his pose from ~4s in, so the bubble
 * waits until then; visible ~2s, then shrinks back to nothing.
 */
const BUBBLE_START_S = 4;
const BUBBLE_VISIBLE_S = 2;
const BUBBLE_SHRINK_MS = 350;
const TYPEWRITER_MS_PER_CHAR = 32;

/**
 * Screen 8 -- last screen of the SignUp flow. The REX mp4 plays once
 * (moved here from Splash -- this is where it belongs, matching
 * apps/customer-app's real RegisterSuccess -> WelcomeVideo order) with a
 * code-driven "Hello, {name}!" speech bubble layered on top -- REX himself
 * is baked into the clip, only the bubble is real UI, same approach as the
 * real screen. Name comes from what was entered back in SignUp (Basic
 * Info), via signUpDraftStore -- that's *why* this can't run any earlier
 * than after that step. Once finished, this preview has nowhere further to
 * go (no Home screen here, see README); "Restart Preview" loops back to
 * Welcome.
 */
export function WelcomeVideoScreen({ navigation }: Props) {
  const firstName = useSignUpFirstName();
  const welcomeText = useSignUpWelcomeGreeting();
  const [finished, setFinished] = useState(false);
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const [typedChars, setTypedChars] = useState(0);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef(false);

  const player = useVideoPlayer(REX_VIDEO, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => setFinished(true));
    return () => subscription.remove();
  }, [player]);

  // Grow the bubble in (spring, slight overshoot for a "pop"), type the
  // name out, hold, then shrink back to the same anchor point -- never a
  // fade, never a move, only rescaling, per the real screen's spec.
  useEffect(() => {
    const growTimer = setTimeout(() => {
      if (cancelledRef.current) return;
      Animated.spring(bubbleScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start(({ finished: grew }) => {
        if (!grew || cancelledRef.current) return;
        let charsRevealed = 0;
        typeIntervalRef.current = setInterval(() => {
          charsRevealed += 1;
          setTypedChars(charsRevealed);
          if (charsRevealed >= welcomeText.length && typeIntervalRef.current) {
            clearInterval(typeIntervalRef.current);
            typeIntervalRef.current = null;
          }
        }, TYPEWRITER_MS_PER_CHAR);
      });
    }, BUBBLE_START_S * 1000);

    const shrinkTimer = setTimeout(
      () => {
        if (cancelledRef.current) return;
        if (typeIntervalRef.current) {
          clearInterval(typeIntervalRef.current);
          typeIntervalRef.current = null;
        }
        setTypedChars(welcomeText.length);
        Animated.timing(bubbleScale, { toValue: 0, duration: BUBBLE_SHRINK_MS, useNativeDriver: true }).start();
      },
      (BUBBLE_START_S + BUBBLE_VISIBLE_S) * 1000,
    );

    return () => {
      clearTimeout(growTimer);
      clearTimeout(shrinkTimer);
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [welcomeText]);

  if (finished) {
    return (
      <View style={styles.endPage}>
        <StatusBar style="light" />
        <Text style={styles.endHeading}>Welcome to RAPEX, {firstName}! 🎉</Text>
        <Text style={styles.endSubheading}>
          This is the end of the auth preview -- in the real app, this hands off to Home
          (apps/customer-app).
        </Text>
        <GradientButton title="Restart Preview" onPress={() => navigation.popToTop()} />
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <StatusBar style="light" hidden />
      {/* contain, not cover -- REX must never be cropped, matching the real screen. */}
      <VideoView player={player} style={styles.video} contentFit="contain" nativeControls={false} />

      <Animated.View pointerEvents="none" style={[styles.bubbleCluster, { transform: [{ scale: bubbleScale }] }]}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{welcomeText.slice(0, typedChars)}</Text>
        </View>
        <View style={styles.bubbleTrailMedium} />
        <View style={styles.bubbleTrailSmall} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#000000" },
  video: { ...StyleSheet.absoluteFill },
  // Positioned above REX's head in the video (he sits in the lower half of
  // the frame) -- percentage-based so it stays correctly placed across
  // device sizes.
  bubbleCluster: { position: "absolute", top: "30%", left: 16, right: 16, alignItems: "center" },
  bubble: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: 160,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  bubbleText: { color: "#1A1030", fontSize: 18, fontWeight: "800", textAlign: "center" },
  bubbleTrailMedium: { width: 14, height: 14, borderRadius: 7, backgroundColor: "rgba(255,255,255,0.8)", marginTop: 6 },
  bubbleTrailSmall: { width: 8, height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.7)", marginTop: 5 },
  endPage: { flex: 1, backgroundColor: "#100B24", padding: 24, justifyContent: "center", alignItems: "center" },
  endHeading: { fontSize: 26, fontWeight: "900", color: "#FFFFFF", marginBottom: 12, textAlign: "center" },
  endSubheading: { fontSize: 15, color: "rgba(255,255,255,0.74)", marginBottom: 28, textAlign: "center", lineHeight: 22 },
});
