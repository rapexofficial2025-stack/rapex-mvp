import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreen } from "./screens/SplashScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { AgeGateScreen } from "./screens/AgeGateScreen";
import { ChildConsentScreen } from "./screens/ChildConsentScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { MobileOtpScreen } from "./screens/MobileOtpScreen";
import { EmailVerificationScreen } from "./screens/EmailVerificationScreen";

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
  Splash: undefined;
  Welcome: undefined;
  AgeGate: undefined;
  ChildConsent: undefined;
  Login: undefined;
  SignUp: undefined;
  MobileOtp: undefined;
  EmailVerification: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: "fade" }} />
          <Stack.Screen name="AgeGate" component={AgeGateScreen} options={{ animation: "slide_from_right" }} />
          <Stack.Screen
            name="ChildConsent"
            component={ChildConsentScreen}
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen name="Login" component={LoginScreen} options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="SignUp" component={SignUpScreen} options={{ animation: "slide_from_right" }} />
          <Stack.Screen name="MobileOtp" component={MobileOtpScreen} options={{ animation: "slide_from_right" }} />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
            options={{ animation: "slide_from_right" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
