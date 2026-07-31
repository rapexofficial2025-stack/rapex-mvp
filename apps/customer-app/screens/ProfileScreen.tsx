import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Profile">,
  NativeStackScreenProps<RootStackParamList>
>;

export function ProfileScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Profile" subtitle="Account settings go here">
      <NavButton label="Wallet" onPress={() => navigation.navigate("Wallet")} />
      <NavButton label="My Auctions" variant="secondary" onPress={() => navigation.navigate("AuctionProfile")} />
      <NavButton label="Log Out" variant="secondary" onPress={() => navigation.navigate("Welcome")} />
    </ScreenContainer>
  );
}
