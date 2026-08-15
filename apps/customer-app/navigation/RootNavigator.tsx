import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { SplashScreen } from "../screens/SplashScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { AgeGateScreen } from "../screens/AgeGateScreen";
import { IpLockoutScreen } from "../screens/IpLockoutScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { PendingApprovalScreen } from "../screens/PendingApprovalScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { PrivacyTermsScreen } from "../screens/register/PrivacyTermsScreen";
import { RegisterAccountScreen } from "../screens/register/RegisterAccountScreen";
import { RegisterSuccessScreen } from "../screens/register/RegisterSuccessScreen";
import { OtpScreen } from "../screens/OtpScreen";
import { WelcomeVideoScreen } from "../screens/WelcomeVideoScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * UI-POLISH SCOPE CUT (temporary, this branch only): everything past REX
 * Welcome -- MainTabs and its whole subtree, Store/Product/Checkout/
 * Address/Wallet/Profile/Rex/Auctions, plus the Profile-only optional steps
 * (RegisterIdentity/RegisterContact/RegisterLocation/Community) that are
 * unreachable once Profile is gone -- is removed from this branch so the
 * flow up to REX Welcome can be polished in isolation. Nothing here is a
 * product decision: the full flow (with all of the above) lives on
 * claude/rapex-deployment-summary-f2nraq and is untouched. Whatever UI
 * changes come out of this branch get merged back into that full flow, not
 * the other way around.
 *
 * Auth flow order (matches the founder-provided reference design, ported
 * from a web mockup to real React Native screens here -- see each screen's
 * own doc comment for what changed structurally):
 *
 *   Splash -> Welcome (Landing, "Let's get Started")
 *     -> AgeGate (real backend 18+ + 48h device lockout check)
 *       -> IpLockout (only if blocked)
 *     -> Login -> Otp (2FA) -> [MainTabs, cut here]
 *       -> PendingApproval (if the account isn't Admin-approved yet)
 *       -> ForgotPassword
 *       -> PrivacyTerms -> Register (single combined form, real signup)
 *         -> RegisterSuccess -> WelcomeVideo (REX) -- last screen in this branch
 */
export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="AgeGate" component={AgeGateScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="IpLockout" component={IpLockoutScreen} />

      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="PendingApproval" component={PendingApprovalScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: "Forgot Password" }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ headerShown: true, title: "Verify" }} />

      <Stack.Screen name="PrivacyTerms" component={PrivacyTermsScreen} options={{ headerShown: true, title: "Privacy & Terms" }} />
      <Stack.Screen name="Register" component={RegisterAccountScreen} />
      <Stack.Screen name="RegisterSuccess" component={RegisterSuccessScreen} />
      <Stack.Screen name="WelcomeVideo" component={WelcomeVideoScreen} />
    </Stack.Navigator>
  );
}
