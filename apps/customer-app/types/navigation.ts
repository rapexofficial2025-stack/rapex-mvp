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
  Checkout: undefined;
  Wallet: undefined;
  Rex: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Marketplace: undefined;
  Wishlist: undefined;
  Orders: undefined;
  Profile: undefined;
};
