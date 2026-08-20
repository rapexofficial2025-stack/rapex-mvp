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
import { RegisterIdentityScreen } from "../screens/register/RegisterIdentityScreen";
import { RegisterContactScreen } from "../screens/register/RegisterContactScreen";
import { RegisterLocationScreen } from "../screens/register/RegisterLocationScreen";
import { CommunityScreen } from "../screens/CommunityScreen";
import { OtpScreen } from "../screens/OtpScreen";
import { WelcomeVideoScreen } from "../screens/WelcomeVideoScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import { StoreScreen } from "../screens/StoreScreen";
import { ProductScreen } from "../screens/ProductScreen";
import { CheckoutScreen } from "../screens/CheckoutScreen";
import { AddressScreen } from "../screens/AddressScreen";
import { WalletScreen } from "../screens/WalletScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { OrdersScreen } from "../screens/OrdersScreen";
import { OrderTrackingScreen } from "../screens/OrderTrackingScreen";
import { EarnScreen } from "../screens/EarnScreen";
import { RexScreen } from "../screens/RexScreen";
import { AuctionHomeScreen } from "../screens/AuctionHomeScreen";
import { AuctionDetailsScreen } from "../screens/AuctionDetailsScreen";
import { AuctionProfileScreen } from "../screens/AuctionProfileScreen";
import { ChildAccountsScreen } from "../screens/child-accounts/ChildAccountsScreen";
import { ChildBasicInfoScreen } from "../screens/child-accounts/ChildBasicInfoScreen";
import { ChildAddressScreen } from "../screens/child-accounts/ChildAddressScreen";
import { ChildStudentStatusScreen } from "../screens/child-accounts/ChildStudentStatusScreen";
import { ChildAuthorizationScreen } from "../screens/child-accounts/ChildAuthorizationScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Auth flow order (matches the founder-provided reference design, ported
 * from a web mockup to real React Native screens here -- see each screen's
 * own doc comment for what changed structurally):
 *
 *   Splash -> Welcome (Landing, "Let's get Started")
 *     -> AgeGate (real backend 18+ + 48h device lockout check)
 *       -> IpLockout (only if blocked)
 *     -> Login -> Otp (2FA) -> MainTabs
 *       -> PendingApproval (if the account isn't Admin-approved yet)
 *       -> ForgotPassword
 *       -> PrivacyTerms -> Register (single combined form, real signup)
 *         -> RegisterSuccess -> WelcomeVideo (REX) -> Profile or Login
 *
 * RegisterIdentity/RegisterContact/RegisterLocation are no longer part of
 * the mandatory chain (the real account already exists after Register) --
 * they're optional, reachable later from Profile's setup checklist.
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

      {/* Optional, post-registration -- reachable from Profile's setup checklist. */}
      <Stack.Screen name="RegisterIdentity" component={RegisterIdentityScreen} options={{ headerShown: true, title: "Identity" }} />
      <Stack.Screen name="RegisterContact" component={RegisterContactScreen} options={{ headerShown: true, title: "Verify Contact" }} />
      <Stack.Screen name="RegisterLocation" component={RegisterLocationScreen} options={{ headerShown: true, title: "Location" }} />
      <Stack.Screen name="Community" component={CommunityScreen} options={{ headerShown: true, title: "Community" }} />

      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Store" component={StoreScreen} options={{ headerShown: true, title: "Store" }} />
      <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: true, title: "Product" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: "Checkout" }} />
      <Stack.Screen name="Address" component={AddressScreen} options={{ headerShown: true, title: "Delivery Address" }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: true, title: "Wallet" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: "Profile" }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: true, title: "My Orders" }} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ headerShown: true, title: "Order Tracking" }} />
      <Stack.Screen name="Earn" component={EarnScreen} options={{ headerShown: true, title: "Earn & Rewards" }} />
      <Stack.Screen name="ChildAccounts" component={ChildAccountsScreen} options={{ headerShown: true, title: "Child Accounts" }} />
      <Stack.Screen name="ChildBasicInfo" component={ChildBasicInfoScreen} options={{ headerShown: true, title: "Add Child" }} />
      <Stack.Screen name="ChildAddress" component={ChildAddressScreen} options={{ headerShown: true, title: "Add Child" }} />
      <Stack.Screen name="ChildStudentStatus" component={ChildStudentStatusScreen} options={{ headerShown: true, title: "Add Child" }} />
      <Stack.Screen name="ChildAuthorization" component={ChildAuthorizationScreen} options={{ headerShown: true, title: "Add Child" }} />
      <Stack.Screen name="Rex" component={RexScreen} options={{ headerShown: true, title: "R.E.X." }} />
      <Stack.Screen name="AuctionHome" component={AuctionHomeScreen} options={{ headerShown: true, title: "Auctions" }} />
      <Stack.Screen
        name="AuctionDetails"
        component={AuctionDetailsScreen}
        options={{ headerShown: true, title: "Auction" }}
      />
      <Stack.Screen
        name="AuctionProfile"
        component={AuctionProfileScreen}
        options={{ headerShown: true, title: "My Auctions" }}
      />
    </Stack.Navigator>
  );
}
