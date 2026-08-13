import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Marketplace: { categoryId?: string } | undefined;
  Wishlist: undefined;
  Orders: undefined;
  Earn: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  AgeGate: undefined;
  IpLockout: undefined;
  Login: undefined;
  PendingApproval: undefined;
  ForgotPassword: undefined;
  PrivacyTerms: undefined;
  Register: undefined;
  RegisterSuccess: undefined;
  RegisterIdentity: undefined;
  RegisterContact: undefined;
  Otp: undefined;
  RegisterLocation: undefined;
  WelcomeVideo: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Store: { storeId: string };
  Product: { productId: string };
  Checkout: { productId: string; quantity: number } | undefined;
  Address: { fromRegistration?: boolean } | undefined;
  Wallet: undefined;
  Profile: undefined;
  Rex: undefined;
  AuctionHome: undefined;
  AuctionDetails: { auctionId: string };
  AuctionProfile: undefined;
};
