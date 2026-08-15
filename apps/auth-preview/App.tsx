import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { AgeGateScreen } from "./screens/AgeGateScreen";
import { LoginScreen } from "./screens/LoginScreen";

/**
 * Standalone, backend-free preview of just the auth screens -- built so
 * editing a screen here and saving shows up on your phone instantly via
 * Expo Go's normal Fast Refresh. Zero native dependencies (no maps, no
 * crash reporting, no Google auth SDK) on purpose: those are what forced
 * the full customer-app into needing a custom EAS dev-client build instead
 * of plain Expo Go. This project never needs that -- `npx expo start`,
 * scan the QR with Expo Go, done.
 *
 * No real backend calls here (see each screen's own note) -- purely
 * visual/UI, matching the real designs in apps/customer-app but with
 * every button either navigating locally or doing nothing. When ready to
 * wire this to the real backend, that happens in apps/customer-app
 * (or by porting these screens back there), not here.
 */
export type AuthStackParamList = {
  Welcome: undefined;
  AgeGate: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="AgeGate" component={AgeGateScreen} options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ animation: "slide_from_right" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
