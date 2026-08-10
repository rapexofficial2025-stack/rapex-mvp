import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "../providers/AppProviders";
import { RootNavigator } from "../navigation/RootNavigator";

export default function App() {
  return (
    <AppProviders>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AppProviders>
  );
}
