import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { SplashScreen } from "../screens/SplashScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterLanguageScreen } from "../screens/register/RegisterLanguageScreen";
import { RegisterBirthdayScreen } from "../screens/register/RegisterBirthdayScreen";
import { RegisterAccountScreen } from "../screens/register/RegisterAccountScreen";
import { RegisterIdentityScreen } from "../screens/register/RegisterIdentityScreen";
import { RegisterContactScreen } from "../screens/register/RegisterContactScreen";
import { RegisterLocationScreen } from "../screens/register/RegisterLocationScreen";
import { OtpScreen } from "../screens/OtpScreen";
import { WelcomeVideoScreen } from "../screens/WelcomeVideoScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import { StoreScreen } from "../screens/StoreScreen";
import { ProductScreen } from "../screens/ProductScreen";
import { CheckoutScreen } from "../screens/CheckoutScreen";
import { AddressScreen } from "../screens/AddressScreen";
import { WalletScreen } from "../screens/WalletScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { RexScreen } from "../screens/RexScreen";
import { AuctionHomeScreen } from "../screens/AuctionHomeScreen";
import { AuctionDetailsScreen } from "../screens/AuctionDetailsScreen";
import { AuctionProfileScreen } from "../screens/AuctionProfileScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      {/* Login1 (Welcome, above) -> Login2 (below): explicit slide transition for the
          two-stage login flow, distinct from the default push animation used elsewhere. */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: "slide_from_right" }} />

      {/* Registration wizard, steps 1-7 (see each screen's doc comment for the exact Xano-contract boundary at each step). */}
      <Stack.Screen name="RegisterLanguage" component={RegisterLanguageScreen} options={{ headerShown: true, title: "Language" }} />
      <Stack.Screen name="RegisterBirthday" component={RegisterBirthdayScreen} options={{ headerShown: true, title: "Date of Birth" }} />
      <Stack.Screen name="Register" component={RegisterAccountScreen} options={{ headerShown: true, title: "Create Account" }} />
      <Stack.Screen name="RegisterIdentity" component={RegisterIdentityScreen} options={{ headerShown: true, title: "Identity" }} />
      <Stack.Screen name="RegisterContact" component={RegisterContactScreen} options={{ headerShown: true, title: "Verify Contact" }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ headerShown: true, title: "Verify" }} />
      <Stack.Screen name="RegisterLocation" component={RegisterLocationScreen} options={{ headerShown: true, title: "Location" }} />
      <Stack.Screen name="WelcomeVideo" component={WelcomeVideoScreen} />

      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Store" component={StoreScreen} options={{ headerShown: true, title: "Store" }} />
      <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: true, title: "Product" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: "Checkout" }} />
      <Stack.Screen name="Address" component={AddressScreen} options={{ headerShown: true, title: "Delivery Address" }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: true, title: "Wallet" }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: "Profile" }} />
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
