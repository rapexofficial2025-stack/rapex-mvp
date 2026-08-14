import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { ErrorBoundary } from "@rapex/ui-native";
import { AppProviders } from "../providers/AppProviders";
import { RootNavigator } from "../navigation/RootNavigator";
import { reportCrash } from "../services/sentry";

export default function App() {
  return (
    <ErrorBoundary onError={reportCrash}>
      <AppProviders>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AppProviders>
    </ErrorBoundary>
  );
}
