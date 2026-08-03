import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { SplashScreen } from "../screens/SplashScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { OtpScreen } from "../screens/OtpScreen";
import { VerificationScreen } from "../screens/VerificationScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import { StoreScreen } from "../screens/StoreScreen";
import { ProductScreen } from "../screens/ProductScreen";
import { CheckoutScreen } from "../screens/CheckoutScreen";
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
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Store" component={StoreScreen} options={{ headerShown: true, title: "Store" }} />
      <Stack.Screen name="Product" component={ProductScreen} options={{ headerShown: true, title: "Product" }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: true, title: "Checkout" }} />
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
