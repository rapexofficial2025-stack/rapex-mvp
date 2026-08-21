import { useContext } from "react";
import { MerchantStoreContext } from "./merchantStoreContext";

export function useMerchantStoreWorkspace() {
  const value = useContext(MerchantStoreContext);
  if (!value) throw new Error("useMerchantStoreWorkspace must be used inside MerchantStoreProvider.");
  return value;
}
