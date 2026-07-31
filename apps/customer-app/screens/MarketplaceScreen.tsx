import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Marketplace">,
  NativeStackScreenProps<RootStackParamList>
>;

export function MarketplaceScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Marketplace" subtitle="Category grid + store/product search go here">
      <NavButton
        label="View Product"
        onPress={() => navigation.navigate("Product", { productId: "placeholder-product" })}
      />
      <NavButton label="Browse Auctions" variant="secondary" onPress={() => navigation.navigate("AuctionHome")} />
    </ScreenContainer>
  );
}
