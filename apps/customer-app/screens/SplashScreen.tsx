import { useEffect } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { getWelcomeSeen } from "../services/welcomeSeenStore";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const SPLASH_DURATION_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Every app launch: 3s branded splash, then a real session check.
 * Not authenticated -> Welcome. Authenticated -> only route straight to
 * Home (MainTabs) once the first-time REX welcome has actually been shown
 * for that user (welcomeSeenStore, persisted per-user-id) -- an
 * authenticated session that never finished onboarding (e.g. the app was
 * killed mid-flow) lands on Profile instead, matching "returning user ->
 * normal app" vs. "incomplete profile -> Profile Setup". There's no
 * confirmed Xano field for profile-completion, so this only uses state
 * this app can actually verify.
 */
export function SplashScreen({ navigation }: Props) {
  const { auth } = useRepositories();

  useEffect(() => {
    let cancelled = false;

    Promise.all([sleep(SPLASH_DURATION_MS), auth.getCurrentUser()]).then(async ([, user]) => {
      if (cancelled) return;
      if (!user) {
        navigation.replace("Welcome");
        return;
      }
      const welcomeSeen = await getWelcomeSeen(user.id);
      if (cancelled) return;
      navigation.replace(welcomeSeen ? "MainTabs" : "Profile");
    });

    return () => {
      cancelled = true;
    };
  }, [navigation, auth]);

  return <ScreenContainer title="RAPEX" subtitle="Gawang Lokal, Para sa Masa" />;
}
