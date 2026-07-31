import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = NativeStackScreenProps<RootStackParamList, "Product">;

export function ProductScreen({ navigation, route }: Props) {
  return (
    <ScreenContainer title="Product" subtitle={`Product detail + variants (productId: ${route.params.productId})`}>
      <NavButton label="Checkout" onPress={() => navigation.navigate("Checkout")} />
    </ScreenContainer>
  );
}
