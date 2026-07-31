import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = NativeStackScreenProps<RootStackParamList, "Verification">;

export function VerificationScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="You're Verified" subtitle="Account verification complete">
      <NavButton label="Continue to RAPEX" onPress={() => navigation.replace("MainTabs")} />
    </ScreenContainer>
  );
}
