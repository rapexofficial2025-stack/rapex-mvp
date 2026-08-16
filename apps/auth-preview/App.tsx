import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { SplashScreen } from "./screens/SplashScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import { AgeGateScreen } from "./screens/AgeGateScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { SignUpAddressScreen } from "./screens/SignUpAddressScreen";
import { SignUpProfileWalletScreen } from "./screens/SignUpProfileWalletScreen";
import { SignUpCompleteScreen } from "./screens/SignUpCompleteScreen";
import { WelcomeVideoScreen } from "./screens/WelcomeVideoScreen";

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
  Login: undefined;
  SignUp: undefined;
  SignUpAddress: undefined;
  SignUpProfileWallet: undefined;
  SignUpComplete: undefined;
  WelcomeVideo: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Real back-arrow, no title text, transparent so each screen's own dark background shows through. */
const transparentHeaderOptions = {
  headerShown: true,
  headerTransparent: true,
  headerTitle: "",
  headerTintColor: "#FFFFFF",
} as const;

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          {/* Splash and Welcome stay headerless -- Splash has nothing to go back to, and
              Welcome's own swipe-to-continue button is the only way forward, no back arrow. */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: "fade" }} />

          {/* From here on, a real back-arrow appears (transparent header, no title, white
              tint -- these screens each have their own full-bleed dark background). */}
          <Stack.Screen
            name="AgeGate"
            component={AgeGateScreen}
            options={{ animation: "slide_from_right", ...transparentHeaderOptions }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ animation: "slide_from_right", ...transparentHeaderOptions }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ animation: "slide_from_right", ...transparentHeaderOptions }}
          />
          <Stack.Screen
            name="SignUpAddress"
            component={SignUpAddressScreen}
            options={{ animation: "slide_from_right", ...transparentHeaderOptions }}
          />
          <Stack.Screen
            name="SignUpProfileWallet"
            component={SignUpProfileWalletScreen}
            options={{ animation: "slide_from_right", ...transparentHeaderOptions }}
          />
          <Stack.Screen
            name="SignUpComplete"
            component={SignUpCompleteScreen}
            options={{ animation: "slide_from_right", ...transparentHeaderOptions }}
          />
          {/* Terminal screen of this preview -- headerless, no back arrow (nothing
              to usefully go back to once the video's playing/finished). */}
          <Stack.Screen name="WelcomeVideo" component={WelcomeVideoScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
