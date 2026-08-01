import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Marketplace: { categoryId?: string } | undefined;
  Wishlist: undefined;
  Orders: undefined;
  Profile: undefined;
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
  Checkout: { productId: string; quantity: number };
  Wallet: undefined;
  Rex: undefined;
  AuctionHome: undefined;
  AuctionDetails: { auctionId: string };
  AuctionProfile: undefined;
};
