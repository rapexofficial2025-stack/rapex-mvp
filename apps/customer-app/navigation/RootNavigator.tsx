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
import { RexScreen } from "../screens/RexScreen";

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
      <Stack.Screen name="Rex" component={RexScreen} options={{ headerShown: true, title: "R.E.X." }} />
    </Stack.Navigator>
  );
}
