import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Log In" subtitle="Email/phone + password form goes here (Sprint FE-02+)">
      <NavButton label="Log In" onPress={() => navigation.navigate("Otp", { destination: "login" })} />
      <NavButton label="Don't have an account? Register" variant="secondary" onPress={() => navigation.navigate("Register")} />
    </ScreenContainer>
  );
}
