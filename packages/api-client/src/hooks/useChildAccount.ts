import type { ID } from "@rapex/types";
import { useRepositories } from "../RepositoryProvider";
import { useAsync, type AsyncState } from "./useAsync";
import type { ChildAccountSummary, ChildBaonSummary } from "../repositories/types";

export function useChildAccounts(): AsyncState<ChildAccountSummary[]> {
  const { childAccount } = useRepositories();
  return useAsync(() => {
    if (!childAccount) throw new Error("childAccount repository is not configured for this app.");
    return childAccount.listChildAccounts();
  }, [childAccount]);
}

export function useChildBaon(childId: ID | null): AsyncState<ChildBaonSummary | null> {
  const { childAccount } = useRepositories();
  return useAsync(() => {
    if (!childAccount || !childId) return Promise.resolve(null);
    return childAccount.getChildBaon(childId);
  }, [childAccount, childId]);
}
