import { useEffect, useRef, useState } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
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
 * Real RAPEX Welcome video (2026-08-14) -- a single composited clip: brand
 * mark forming out of a dark flare (~0-3s), then the full RAPEX/REX
 * composition holding steady through the rest of the clip (~4-9.5s). REX
 * himself is baked directly into the video, not a separate transparent
 * layer -- confirmed deliberately simpler than a multi-layer approach,
 * since aligning a separate REX asset over a separate background proved
 * impractical both in video editing and in code. No personalized text is
 * baked into the clip (confirmed by inspecting frames across the full
 * timeline), so the dynamic "Welcome, {name}!" text below is real UI
 * overlaid on top, not part of the video itself.
 */
const WELCOME_VIDEO_SOURCE: VideoSource | null = require("../assets/video/welcome.mp4");

const LOGO = require("../../../assets/brand/Branding Logo (Available)/Logo.png");
const TAGLINE = "Gawang Lokal, Para sa Masa";

/**
 * Matches the real video's actual duration (900x1920 @ 30fps, 284 frames =
 * 9.467s -- measured directly from the file, not assumed) with a small
 * margin so the timer never cuts the clip off early. Still the one timer
 * authoritative for navigation, independent of video playback, per the
 * existing design below -- a video that runs long or short shouldn't
 * change when this screen exits.
 */
const WELCOME_DURATION_S = 9.5;
const REVEAL_PHASE_S = WELCOME_DURATION_S / 3; // fallback-only reveal phasing, see !hasVideo branch below

/**
 * The welcome speech-bubble timing -- code-driven animation layered over
 * the video (REX himself stays baked into the clip, only this bubble is
 * real UI). REX is fully visible and holding his pose from ~4s in the
 * real video, so the bubble waits until then to appear.
 */
const BUBBLE_START_S = 4;
/** How long the bubble stays fully grown/visible before it shrinks back down -- "around 2 seconds" per spec. */
const BUBBLE_VISIBLE_S = 2;
const BUBBLE_GROW_MS = 450;
const BUBBLE_SHRINK_MS = 350;
const TYPEWRITER_MS_PER_CHAR = 32;

export function WelcomeVideoScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const draft = useRegistrationDraft();
  const firstName = draft.firstName || "there";
  const welcomeText = `Welcome, ${firstName}!`;
  const [secondsLeft, setSecondsLeft] = useState(WELCOME_DURATION_S);
  const [finishing, setFinishing] = useState(false);
  // Speech-bubble animation: scale-driven (not opacity), matching spec --
  // "just pop up like Fading but we do is ReScaling". Starts at 0 (fully
  // collapsed, invisible) so the Animated.View can stay mounted the whole
  // time without a separate visibility flag.
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const [typedChars, setTypedChars] = useState(0);
  const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Real branding.tagline (2026-08-14 Xano confirmation), only reachable
  // for a real session -- getAuthMe() requires auth, so this stays null for
  // the pending-registration path and the existing hardcoded TAGLINE below
  // is the fallback in every case where it isn't available.
  const [taglineOverride, setTaglineOverride] = useState<string | null>(null);
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

  // Fires once on mount, independent of the countdown -- only proceeds to
  // fetch branding if a real session already exists (getCurrentUser() is a
  // local cache read, not a network call, so this is cheap even on the
  // pending-registration path where it simply resolves null and stops).
  useEffect(() => {
    auth
      .getCurrentUser()
      .then((user) => (user ? auth.getAuthMe() : null))
      .then((authMe) => {
        if (cancelledRef.current) return;
        if (authMe?.branding?.tagline) setTaglineOverride(authMe.branding.tagline);
      })
      .catch(() => {
        // Fetch failed -- stay on the existing hardcoded TAGLINE, same as
        // never having branding data at all.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

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
      // UI-POLISH SCOPE CUT (temporary, this branch only): the real
      // next_step values here are PROFILE_SETUP and the authenticated
      // default (MainTabs), but Profile/MainTabs don't exist in this
      // branch -- see RootNavigator.tsx's doc comment. Falls back to Login
      // rather than silently pretending those screens still exist; restore
      // the real "Profile" / "MainTabs" targets when this merges back into
      // claude/rapex-deployment-summary-f2nraq.
      case "PROFILE_SETUP":
      default:
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

  // The welcome speech bubble: grow in (scale 0 -> 1, slight overshoot for
  // a "pop" feel) once REX is settled, type out the name, hold, then
  // shrink back to 0 at the same anchor point it grew from -- never a
  // fade, never a move, just rescaling in place per spec. Runs on its own
  // real-time timers (not the once-per-second countdown state above) so
  // the motion itself stays smooth.
  useEffect(() => {
    if (!hasVideo) return undefined;

    const growTimer = setTimeout(() => {
      if (cancelledRef.current) return;
      Animated.spring(bubbleScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (!finished || cancelledRef.current) return;
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
        setTypedChars(welcomeText.length); // don't leave it mid-type if the hold window was short
        Animated.timing(bubbleScale, {
          toValue: 0,
          duration: BUBBLE_SHRINK_MS,
          useNativeDriver: true,
        }).start();
      },
      (BUBBLE_START_S + BUBBLE_VISIBLE_S) * 1000,
    );

    return () => {
      clearTimeout(growTimer);
      clearTimeout(shrinkTimer);
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVideo]);

  const elapsed = WELCOME_DURATION_S - secondsLeft;
  const progress = Math.min(1, elapsed / WELCOME_DURATION_S);
  const revealStep = Math.min(2, Math.floor(elapsed / REVEAL_PHASE_S)); // 0=RAPEX, 1=REX, 2=Hi {name}

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image source={LOGO} style={styles.logo} resizeMode="contain" />
      <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>{taglineOverride ?? TAGLINE}</Text>

      <View style={styles.canvas}>
        <View style={styles.countdownBadge}>
          <Text style={styles.countdownBadgeText}>{Math.max(0, Math.ceil(secondsLeft))}s</Text>
        </View>
        {hasVideo ? (
          <>
            {/* "contain", not "cover" -- REX must never be cropped; the real
                video's own aspect ratio (900x1920) is close enough to the
                canvas below that this rarely letterboxes in practice. */}
            <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls={false} />
            {/* Speech-bubble trail (small -> big, like a classic thought-bubble
                leading up from REX's head) + the bubble itself, all inside one
                Animated.View so the whole cluster scales as a single unit from
                one fixed anchor point -- never moves, never fades, only rescales. */}
            <Animated.View
              pointerEvents="none"
              style={[styles.bubbleCluster, { transform: [{ scale: bubbleScale }] }]}
            >
              <View style={styles.bubble}>
                <Text style={styles.bubbleText}>{welcomeText.slice(0, typedChars)}</Text>
              </View>
              <View style={styles.bubbleTrailMedium} />
              <View style={styles.bubbleTrailSmall} />
            </Animated.View>
          </>
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
      <Text style={[styles.countdownText, { color: theme.colors.textSecondary }]}>{Math.max(0, Math.ceil(secondsLeft))}s</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 24 },
  logo: { width: 64, height: 64 },
  tagline: { fontSize: 14, fontWeight: "600", letterSpacing: 0.5 },
  canvas: {
    width: "100%",
    aspectRatio: 900 / 1920, // matches the real welcome.mp4's actual dimensions
    maxHeight: 420,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  // Positioned above REX's head in the real video (he sits roughly in the
  // lower half of the frame) -- percentage-based so it stays correctly
  // placed as the canvas is scaled responsively across device sizes.
  bubbleCluster: {
    position: "absolute",
    top: "30%",
    left: 16,
    right: 16,
    alignItems: "center",
  },
  bubble: {
    backgroundColor: "rgba(255,255,255,0.88)", // slightly transparent -- background/REX stay faintly visible through it
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
  bubbleText: {
    color: "#1A1030",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  // The two trailing dots below the bubble -- a classic thought-bubble
  // tail (small, then medium, growing toward the main bubble).
  bubbleTrailMedium: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginTop: 6,
  },
  bubbleTrailSmall: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.7)",
    marginTop: 5,
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
