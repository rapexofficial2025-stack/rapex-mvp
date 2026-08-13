import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
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
 * RAPEX Welcome video is added at that path. No such file exists in this
 * repo today -- shipping a fabricated/corrupt placeholder video would be
 * worse than not having one, so the canvas below falls back to a text
 * reveal sequence (RAPEX / REX / "Hi, {name}!") when there's nothing to
 * play. Everything else (the 10s countdown, play-once guarantee,
 * welcome_seen persistence) is fully wired and needs no change once a real
 * source is set -- the video simply fills the same canvas area.
 */
const WELCOME_VIDEO_SOURCE: VideoSource | null = null;

const LOGO = require("../../../assets/brand/Branding Logo (Available)/Logo.png");
const TAGLINE = "Gawang Lokal, Para sa Masa";

const WELCOME_DURATION_S = 10;
const REVEAL_PHASE_S = WELCOME_DURATION_S / 3; // RAPEX / REX / Hi {name}, evenly split across the 10s window

export function WelcomeVideoScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const draft = useRegistrationDraft();
  const [secondsLeft, setSecondsLeft] = useState(WELCOME_DURATION_S);
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
      // Setup to finish, per spec.
      await setWelcomeSeen(user.id);
      navigation.replace("Profile");
    } else {
      // Password registration: the account is `pending_verification` and
      // has no session yet -- honest, since Admin approval is required
      // before login works. Nothing to show on Profile without a session.
      navigation.replace("Login");
    }
  }

  // Exactly 10 seconds, then auto-advance -- the one timer authoritative
  // for navigation, independent of whether a real video is playing (a
  // video that runs long or short shouldn't change when this exits).
  useEffect(() => {
    if (secondsLeft <= 0) {
      finish();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const elapsed = WELCOME_DURATION_S - secondsLeft;
  const progress = Math.min(1, elapsed / WELCOME_DURATION_S);
  const revealStep = Math.min(2, Math.floor(elapsed / REVEAL_PHASE_S)); // 0=RAPEX, 1=REX, 2=Hi {name}
  const firstName = draft.firstName || "there";

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>{TAGLINE}</Text>

      <View style={styles.canvas}>
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

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: theme.colors.brandPrimary }]} />
      </View>
      <Text style={[styles.countdownText, { color: theme.colors.textSecondary }]}>{secondsLeft}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 24 },
  logo: { width: 64, height: 64 },
  tagline: { fontSize: 14, fontWeight: "600", letterSpacing: 0.5 },
  canvas: {
    width: "100%",
    aspectRatio: 9 / 12,
    maxHeight: 420,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  revealWrap: { alignItems: "center", justifyContent: "center" },
  revealText: { fontSize: 48, fontWeight: "800", letterSpacing: 2 },
  progressTrack: {
    width: "100%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 3 },
  countdownText: { fontSize: 12, fontWeight: "600" },
});
