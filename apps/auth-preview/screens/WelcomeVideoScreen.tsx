import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useVideoPlayer, VideoView } from "expo-video";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { GradientButton } from "../components/buttons/GradientButton";

type Props = NativeStackScreenProps<AuthStackParamList, "WelcomeVideo">;

// Placeholder -- structure/flow only. Drop the real file in at this path
// and it resolves automatically, no code change needed.
const REX_VIDEO = require("../assets/videos/rex-intro.mp4");

/**
 * Screen 8 -- last screen of the SignUp flow. Plays the REX mp4 once
 * (moved here from Splash per product correction -- this is where it
 * belongs, matching apps/customer-app's real RegisterSuccess ->
 * WelcomeVideo order). Once it finishes, this preview app has nothing
 * further to show (no Home screen here -- see README, that's
 * apps/customer-app's job); "Restart Preview" loops back to Welcome so you
 * can re-test the flow without closing/reopening the app.
 */
export function WelcomeVideoScreen({ navigation }: Props) {
  const [finished, setFinished] = useState(false);
  const player = useVideoPlayer(REX_VIDEO, (p) => {
    p.loop = false;
    p.play();
  });

  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => setFinished(true));
    return () => subscription.remove();
  }, [player]);

  if (finished) {
    return (
      <View style={styles.endPage}>
        <StatusBar style="light" />
        <Text style={styles.endHeading}>Welcome to RAPEX! 🎉</Text>
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
      <VideoView player={player} style={styles.video} contentFit="cover" nativeControls={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#000000" },
  video: { ...StyleSheet.absoluteFill },
  endPage: { flex: 1, backgroundColor: "#100B24", padding: 24, justifyContent: "center", alignItems: "center" },
  endHeading: { fontSize: 28, fontWeight: "900", color: "#FFFFFF", marginBottom: 12, textAlign: "center" },
  endSubheading: { fontSize: 15, color: "rgba(255,255,255,0.74)", marginBottom: 28, textAlign: "center", lineHeight: 22 },
});
