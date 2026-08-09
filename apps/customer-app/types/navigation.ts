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
  Login: undefined;
  Register: undefined;
  Otp: { destination: string };
  Verification: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Store: { storeId: string };
  Product: { productId: string };
  Checkout: { productId: string; quantity: number } | undefined;
  Address: undefined;
  Wallet: undefined;
  Profile: undefined;
  Rex: undefined;
  AuctionHome: undefined;
  AuctionDetails: { auctionId: string };
  AuctionProfile: undefined;
};
