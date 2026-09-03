import { useMemo, useState, type ReactNode } from "react";
import { useMyStores, type MerchantStore } from "@rapex/api-client";
import { MerchantStoreContext, type MerchantStoreContextValue } from "./merchantStoreContext";

const EMPTY_STORES: MerchantStore[] = [];

export function MerchantStoreProvider({ children }: { children: ReactNode }) {
  const storesState = useMyStores();
  const [requestedStoreId, setRequestedStoreId] = useState<string | null>(null);
  const stores = storesState.data ?? EMPTY_STORES;
  const currentStoreId = stores.some((store) => store.id === requestedStoreId) ? requestedStoreId : (stores[0]?.id ?? null);
  const currentStore = stores.find((store) => store.id === currentStoreId) ?? null;
  const value = useMemo<MerchantStoreContextValue>(
    () => ({
      stores,
      currentStoreId,
      currentStore,
      loading: storesState.loading,
      error: storesState.error,
      setCurrentStoreId: setRequestedStoreId,
      refetch: storesState.refetch,
    }),
    [currentStore, currentStoreId, stores, storesState.error, storesState.loading, storesState.refetch],
  );

  return <MerchantStoreContext.Provider value={value}>{children}</MerchantStoreContext.Provider>;
}
