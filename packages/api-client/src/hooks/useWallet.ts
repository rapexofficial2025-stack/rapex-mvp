import { useRepositories } from "../RepositoryProvider";
import { useAsync, type AsyncState } from "./useAsync";
import type { WalletSummary } from "../repositories/types";

export function useWalletSummary(): AsyncState<WalletSummary> {
  const { wallet } = useRepositories();
  return useAsync(() => wallet.getWalletSummary(), []);
}
