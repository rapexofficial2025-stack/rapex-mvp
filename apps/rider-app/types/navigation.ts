import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Earnings: undefined;
  Wallet: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Otp: undefined;
  Verification: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Delivery: undefined;
  DeliverySuccess: { orderId: string };
  Incentives: undefined;
  Referral: undefined;
  EditProfile: undefined;
};
