import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export function ProfileScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Profile" subtitle="Account settings go here">
      <NavButton label="Wallet" onPress={() => navigation.navigate("Wallet")} />
      <NavButton label="Log Out" variant="secondary" onPress={() => navigation.navigate("Welcome")} />
    </ScreenContainer>
  );
}
