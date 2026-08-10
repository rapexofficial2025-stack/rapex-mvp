import { useEffect } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace("Welcome"), 800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return <ScreenContainer title="RAPEX" subtitle="Gawang Lokal, Para sa Masa" />;
}
