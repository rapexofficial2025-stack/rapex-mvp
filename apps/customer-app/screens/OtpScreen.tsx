import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = NativeStackScreenProps<RootStackParamList, "Otp">;

export function OtpScreen({ navigation, route }: Props) {
  return (
    <ScreenContainer title="Enter OTP" subtitle={`Verification code sent (flow: ${route.params.destination})`}>
      <NavButton label="Verify" onPress={() => navigation.navigate("Verification")} />
    </ScreenContainer>
  );
}
