import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import { ErrorBoundary } from "@rapex/ui-native";
import { AppProviders } from "../providers/AppProviders";
import { RootNavigator } from "../navigation/RootNavigator";
import { reportCrash } from "../services/sentry";

// Required for expo-auth-session's browser-based OAuth flow (Google
// sign-in) to close its popup/tab and return control to the app once
// Google redirects back -- without this the flow hangs open after the
// user approves, same fix already applied in customer-app.
WebBrowser.maybeCompleteAuthSession();

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
