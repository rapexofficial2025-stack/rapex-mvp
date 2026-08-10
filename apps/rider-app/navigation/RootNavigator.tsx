import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { SplashScreen } from "../screens/SplashScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { OtpScreen } from "../screens/OtpScreen";
import { VerificationScreen } from "../screens/VerificationScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import { DeliveryScreen } from "../screens/DeliveryScreen";
import { DeliverySuccessScreen } from "../screens/DeliverySuccessScreen";
import { EditProfileScreen } from "../screens/EditProfileScreen";
import { IncentivesScreen } from "../screens/IncentivesScreen";
import { ReferralScreen } from "../screens/ReferralScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      {/* Login1 (Welcome, above) -> Login2 (below): explicit slide transition for the
          two-stage login flow, distinct from the default push animation used elsewhere. */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="Delivery" component={DeliveryScreen} options={{ headerShown: true, title: "Active Delivery" }} />
      <Stack.Screen
        name="DeliverySuccess"
        component={DeliverySuccessScreen}
        options={{ headerShown: true, title: "Order Completed", gestureEnabled: false }}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true, title: "Edit Profile" }} />
      <Stack.Screen name="Incentives" component={IncentivesScreen} options={{ headerShown: true, title: "Weekly Incentive" }} />
      <Stack.Screen name="Referral" component={ReferralScreen} options={{ headerShown: true, title: "Referral Program" }} />
    </Stack.Navigator>
  );
}
