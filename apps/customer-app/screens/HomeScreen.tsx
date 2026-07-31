import type { CompositeScreenProps } from "@react-navigation/native";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabParamList, RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { NavButton } from "../components/NavButton";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  return (
    <ScreenContainer title="Home" subtitle="Featured stores, promos, categories go here">
      <NavButton label="Chat with R.E.X." onPress={() => navigation.navigate("Rex")} />
      <NavButton
        label="Browse a Store"
        variant="secondary"
        onPress={() => navigation.navigate("Store", { storeId: "placeholder-store" })}
      />
    </ScreenContainer>
  );
}
