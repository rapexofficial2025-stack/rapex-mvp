export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Otp: { destination: string };
  Verification: undefined;
  MainTabs: undefined;
  Store: { storeId: string };
  Product: { productId: string };
  Checkout: { productId: string; quantity: number };
  Wallet: undefined;
  Rex: undefined;
  AuctionHome: undefined;
  AuctionDetails: { auctionId: string };
  AuctionProfile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Marketplace: undefined;
  Wishlist: undefined;
  Orders: undefined;
  Profile: undefined;
};
