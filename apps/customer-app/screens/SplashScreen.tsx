import { useEffect } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const SPLASH_DURATION_MS = 3000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Every app launch: 3s branded splash, then a real session check. Not
 * authenticated -> Welcome. Authenticated -> ask the real backend
 * "navigation brain" (GET /auth/me's next_step, see XanoAuthRepository)
 * where this session belongs, instead of a local heuristic -- this is the
 * one screen every returning session passes through, so it's the natural
 * place to honor next_step.
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
      const nextStep = await auth.getNextStep();
      if (cancelled) return;
      switch (nextStep) {
        case "PRIVACY_TERMS":
          navigation.replace("PrivacyTerms");
          break;
        case "REGISTRATION":
          navigation.replace("RegisterLanguage");
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
    });

    return () => {
      cancelled = true;
    };
  }, [navigation, auth]);

  return <ScreenContainer title="RAPEX" subtitle="Gawang Lokal, Para sa Masa" />;
}
