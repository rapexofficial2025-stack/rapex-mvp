import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Button } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

/**
 * Auth entry screen. Google/Facebook are shown per instruction but disabled
 * -- Firebase (mentioned as "connect Firebase, SDK to follow later") isn't
 * wired yet, so these can't do anything real today. Same honest
 * "disabled + labeled" pattern as CheckoutScreen's non-wallet payment
 * methods, rather than a fake OAuth flow.
 */
export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Welcome to RAPEX" subtitle="Your hyperlocal marketplace and delivery app">
      <Button label="Sign In" onPress={() => navigation.navigate("Login")} />
      <Button label="Create RAPEX Account" variant="secondary" onPress={() => navigation.navigate("RegisterLanguage")} />

      <Button label="Continue with Google" variant="outline" disabled />
      <Button label="Continue with Facebook" variant="outline" disabled />
      <Badge label="Google/Facebook sign-in requires Firebase configuration -- not connected yet" tone="warning" />
    </ScreenContainer>
  );
}
