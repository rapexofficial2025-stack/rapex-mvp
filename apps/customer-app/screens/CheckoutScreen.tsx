import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = NativeStackScreenProps<RootStackParamList, "Checkout">;

export function CheckoutScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Checkout" subtitle="Address, payment method, order summary go here">
      <NavButton label="Place Order" onPress={() => navigation.navigate("MainTabs")} />
    </ScreenContainer>
  );
}
