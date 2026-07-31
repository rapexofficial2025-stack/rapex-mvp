import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = NativeStackScreenProps<RootStackParamList, "Store">;

export function StoreScreen({ navigation, route }: Props) {
  return (
    <ScreenContainer title="Store" subtitle={`Store profile + product grid (storeId: ${route.params.storeId})`}>
      <NavButton
        label="View Product"
        onPress={() => navigation.navigate("Product", { productId: "placeholder-product" })}
      />
    </ScreenContainer>
  );
}
