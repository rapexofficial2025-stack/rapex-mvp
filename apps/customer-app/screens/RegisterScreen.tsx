import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Create Account" subtitle="Registration form goes here (Sprint FE-02+)">
      <NavButton label="Continue" onPress={() => navigation.navigate("Otp", { destination: "register" })} />
      <NavButton label="Already have an account? Log In" variant="secondary" onPress={() => navigation.navigate("Login")} />
    </ScreenContainer>
  );
}
