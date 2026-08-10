import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { Button } from "@rapex/ui-native";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Welcome to RAPEX" subtitle="Your hyperlocal marketplace and delivery app">
      <Button label="Log In" onPress={() => navigation.navigate("Login")} />
      <Button label="Create Account" variant="secondary" onPress={() => navigation.navigate("Register")} />
    </ScreenContainer>
  );
}
