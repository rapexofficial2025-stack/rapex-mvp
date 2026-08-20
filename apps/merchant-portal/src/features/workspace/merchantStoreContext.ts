import { createContext } from "react";
import type { MerchantStore } from "@rapex/api-client";

export type MerchantStoreContextValue = {
  stores: MerchantStore[];
  currentStoreId: string | null;
  currentStore: MerchantStore | null;
  loading: boolean;
  error: string | null;
  setCurrentStoreId: (storeId: string) => void;
  refetch: () => void;
};

export const MerchantStoreContext = createContext<MerchantStoreContextValue | null>(null);
