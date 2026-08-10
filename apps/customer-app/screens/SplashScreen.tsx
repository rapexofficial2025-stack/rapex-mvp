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

/** Every app launch: 3s branded splash, then a real session check decides Home vs. Auth. */
export function SplashScreen({ navigation }: Props) {
  const { auth } = useRepositories();

  useEffect(() => {
    let cancelled = false;

    Promise.all([sleep(SPLASH_DURATION_MS), auth.getCurrentUser()]).then(([, user]) => {
      if (cancelled) return;
      navigation.replace(user ? "MainTabs" : "Welcome");
    });

    return () => {
      cancelled = true;
    };
  }, [navigation, auth]);

  return <ScreenContainer title="RAPEX" subtitle="Gawang Lokal, Para sa Masa" />;
}
