import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="RAPEX Rider" subtitle="Earn by delivering for your community.">
      <Button label="Log In" onPress={() => navigation.navigate("Login")} />
      <Button label="Create Rider Account" variant="secondary" onPress={() => navigation.navigate("Register")} />
    </ScreenContainer>
  );
}
