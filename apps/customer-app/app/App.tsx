import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "../providers/AppProviders";
import { RootNavigator } from "../navigation/RootNavigator";
import { WebAppFrame } from "../components/WebAppFrame";

export default function App() {
  return (
    <WebAppFrame>
      <AppProviders>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AppProviders>
    </WebAppFrame>
  );
}
