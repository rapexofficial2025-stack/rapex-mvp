import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { ErrorBoundary } from "@rapex/ui-native";
import { AppProviders } from "../providers/AppProviders";
import { RootNavigator } from "../navigation/RootNavigator";

// Required once at startup for expo-auth-session's Google sign-in redirect
// to resolve correctly (closes the auth popup/tab and returns control to
// the app) -- see screens/LoginScreen.tsx.
WebBrowser.maybeCompleteAuthSession();

export default function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <NavigationContainer>
          <RootNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AppProviders>
    </ErrorBoundary>
  );
}
