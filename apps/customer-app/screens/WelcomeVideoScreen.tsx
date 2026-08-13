import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useVideoPlayer, VideoView, type VideoSource } from "expo-video";
import { useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { useAppTheme } from "../hooks/useAppTheme";
import { setWelcomeSeen } from "../services/welcomeSeenStore";
import { resetRegistrationDraft, useRegistrationDraft } from "../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "WelcomeVideo">;

/**
 * Set this to `require("../../assets/video/welcome.mp4")` once the real
 * 10-second RAPEX Welcome video is added at that path. No such file exists
 * in this repo today -- shipping a fabricated/corrupt placeholder video
 * would be worse than not having one, so this screen falls back to a text
 * reveal sequence (RAPEX / REX / "Hi, {name}!", the same content the
 * instruction asked this screen to show) when there's nothing to play.
 * Everything else here (playToEnd handling, play-once guarantee,
 * welcome_seen persistence) is fully wired and needs no change once a real
 * source is set.
 */
const WELCOME_VIDEO_SOURCE: VideoSource | null = null;

const REVEAL_SEQUENCE_MS = 1400;

export function WelcomeVideoScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const draft = useRegistrationDraft();
  const [revealStep, setRevealStep] = useState(0); // 0=RAPEX, 1=REX, 2=Hi {name}
  const [finishing, setFinishing] = useState(false);

  // Always called unconditionally (Rules of Hooks) -- WELCOME_VIDEO_SOURCE
  // is a stable module-level constant, so `hasVideo` never changes across
  // this component's renders; passing `null` as the source when there is
  // none simply leaves the player with nothing loaded.
  const hasVideo = WELCOME_VIDEO_SOURCE !== null;
  const player = useVideoPlayer(WELCOME_VIDEO_SOURCE, (p) => {
    if (hasVideo) p.play();
  });

  async function finish() {
    if (finishing) return;
    setFinishing(true);
    const user = await auth.getCurrentUser();
    resetRegistrationDraft();
    if (user) {
      // Has a real session (e.g. Google first-time sign-in, which the
      // Master Authentication Suite logs in immediately) -- go to Profile
      // to finish setup, per spec.
      await setWelcomeSeen(user.id);
      navigation.replace("Profile");
    } else {
      // Password registration: the account is `pending_verification` and
      // has no session yet -- honest, since Admin approval is required
      // before login works. Nothing to show on Profile without a session.
      navigation.replace("Login");
    }
  }

  // Video path: wait for playToEnd, then run the text reveal, then finish.
  useEffect(() => {
    if (!hasVideo) return;
    const subscription = player.addListener("playToEnd", () => {
      const timer = setTimeout(finish, REVEAL_SEQUENCE_MS * 3);
      return () => clearTimeout(timer);
    });
    return () => subscription.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVideo, player]);

  // No-video path: run the text reveal sequence directly, then finish.
  useEffect(() => {
    if (hasVideo) return;
    if (revealStep >= 2) {
      const timer = setTimeout(finish, REVEAL_SEQUENCE_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setRevealStep((step) => step + 1), REVEAL_SEQUENCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVideo, revealStep]);

  const firstName = draft.firstName || "there";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {hasVideo ? (
        <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      ) : (
        <View style={styles.revealWrap}>
          {revealStep === 0 ? (
            <Text style={[styles.revealText, { color: theme.colors.brandPrimary }]}>RAPEX</Text>
          ) : revealStep === 1 ? (
            <Text style={[styles.revealText, { color: theme.colors.brandPrimary }]}>REX</Text>
          ) : (
            <Text style={[styles.revealText, { color: theme.colors.textPrimary, fontSize: theme.typography.fontSize["2xl"] }]}>
              Hi, {firstName}!
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  revealWrap: { alignItems: "center", justifyContent: "center" },
  revealText: { fontSize: 48, fontWeight: "800", letterSpacing: 2 },
});
