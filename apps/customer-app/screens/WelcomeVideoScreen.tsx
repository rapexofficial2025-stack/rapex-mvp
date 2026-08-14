import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useVideoPlayer, VideoView, type VideoSource } from "expo-video";
import { Sparkles } from "lucide-react-native";
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
  // Guards against navigating/setting state after this screen has already
  // unmounted (e.g. the user backgrounds/leaves mid-countdown) -- same
  // problem SplashScreen's own `cancelled` flag solves, needed here too now
  // that finish() below makes a real network call.
  const cancelledRef = useRef(false);
  useEffect(() => {
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  // Always called unconditionally (Rules of Hooks) -- WELCOME_VIDEO_SOURCE
  // is a stable module-level constant, so `hasVideo` never changes across
  // this component's renders; passing `null` as the source when there is
  // none simply leaves the player with nothing loaded.
  const hasVideo = WELCOME_VIDEO_SOURCE !== null;
  const player = useVideoPlayer(WELCOME_VIDEO_SOURCE, (p) => {
    if (hasVideo) p.play();
  });

  /**
   * Two distinct REX experiences land here, and Xano's confirmed contract
   * (2026-08-14) means they must be handled differently -- both
   * `GET /auth/me` and `POST /acknowledge-welcome` require authentication,
   * and a freshly registered account has no token (signup returns no
   * session, stays `pending_verification` until Admin approval):
   *
   * 1. POST-REGISTRATION (no session, arrived via RegisterSuccessScreen):
   *    local UX only. Never calls acknowledgeWelcome() -- there is no token
   *    to call it with, and this must not create or imply a session that
   *    doesn't exist. Lands on Login; if the account is still pending,
   *    LoginScreen's own catch block already routes to PendingApproval.
   * 2. AUTHENTICATED (real session, e.g. Google first-time sign-in or an
   *    OTP-verified account whose next_step said this beat was still due):
   *    calls the real acknowledgeWelcome() and navigates off ITS returned
   *    next_step, not an assumed destination.
   */
  async function finish() {
    if (finishing) return;
    setFinishing(true);
    const user = await auth.getCurrentUser();
    if (cancelledRef.current) return;
    resetRegistrationDraft();

    if (!user) {
      navigation.replace("Login");
      return;
    }

    await setWelcomeSeen(user.id);
    if (cancelledRef.current) return;
    const nextStep = await auth.acknowledgeWelcome();
    if (cancelledRef.current) return;
    switch (nextStep) {
      case "PRIVACY_TERMS":
        navigation.replace("PrivacyTerms");
        break;
      case "REGISTRATION":
        navigation.replace("PrivacyTerms");
        break;
      case "WELCOME_ANIMATION":
        navigation.replace("WelcomeVideo");
        break;
      case "PROFILE_SETUP":
        navigation.replace("Profile");
        break;
      default:
        navigation.replace("MainTabs");
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
        <View style={styles.countdownBadge}>
          <Text style={styles.countdownBadgeText}>{secondsLeft}s</Text>
        </View>
        {hasVideo ? (
          <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
        ) : (
          <View style={styles.revealWrap}>
            <View style={[styles.mascotBadge, { backgroundColor: theme.colors.brandPrimary }]}>
              <Sparkles color="#FDE68A" size={22} />
            </View>
            <Text style={[styles.mascotLabel, { color: theme.colors.textPrimary }]}>R.E.X AI Mascot Active</Text>
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
  revealWrap: { alignItems: "center", justifyContent: "center", gap: 6 },
  revealText: { fontSize: 48, fontWeight: "800", letterSpacing: 2 },
  mascotBadge: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  mascotLabel: { fontSize: 11, fontWeight: "700" },
  countdownBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.4)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 1,
  },
  countdownBadgeText: { color: "#FBBF24", fontWeight: "800", fontSize: 11 },
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
