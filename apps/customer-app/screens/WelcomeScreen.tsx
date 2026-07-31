import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Welcome to RAPEX" subtitle="Your hyperlocal marketplace and delivery app">
      <NavButton label="Log In" onPress={() => navigation.navigate("Login")} />
      <NavButton label="Create Account" variant="secondary" onPress={() => navigation.navigate("Register")} />
    </ScreenContainer>
  );
}
