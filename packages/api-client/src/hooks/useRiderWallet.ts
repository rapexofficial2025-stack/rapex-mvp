import { useRepositories } from "../RepositoryProvider";
import { useAsync, type AsyncState } from "./useAsync";
import type { IncentiveProgress, ReferralSummary, RiderEarningsSummary, RiderWalletSummary } from "../repositories/types";

export function useRiderWalletSummary(): AsyncState<RiderWalletSummary> {
  const { riderWallet } = useRepositories();
  if (!riderWallet) throw new Error("RiderWalletRepository is not configured on this app's RepositoryProvider.");
  return useAsync(() => riderWallet.getRiderWalletSummary(), []);
}

export function useRiderEarnings(): AsyncState<RiderEarningsSummary> {
  const { riderEconomy } = useRepositories();
  if (!riderEconomy) throw new Error("RiderEconomyRepository is not configured on this app's RepositoryProvider.");
  return useAsync(() => riderEconomy.getEarningsSummary(), []);
}

export function useIncentiveProgress(): AsyncState<IncentiveProgress> {
  const { riderEconomy } = useRepositories();
  if (!riderEconomy) throw new Error("RiderEconomyRepository is not configured on this app's RepositoryProvider.");
  return useAsync(() => riderEconomy.getIncentiveProgress(), []);
}

export function useReferralSummary(): AsyncState<ReferralSummary> {
  const { riderEconomy } = useRepositories();
  if (!riderEconomy) throw new Error("RiderEconomyRepository is not configured on this app's RepositoryProvider.");
  return useAsync(() => riderEconomy.getReferralSummary(), []);
}
