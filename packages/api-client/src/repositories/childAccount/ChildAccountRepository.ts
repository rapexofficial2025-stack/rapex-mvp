import type { ID, ISODateString } from "@rapex/types";
import type { ChildAccountSummary, ChildBaonSummary, ChildPurchaseHistoryEntry, CreateChildAccountInput, UnallocatedBalanceSummary } from "../types";

export interface ChildAccountRepository {
  listChildAccounts(): Promise<ChildAccountSummary[]>;
  getChildAccount(childId: ID): Promise<ChildAccountSummary>;
  createChildAccount(input: CreateChildAccountInput): Promise<ChildAccountSummary>;
  deactivateChildAccount(childId: ID): Promise<void>;
  reactivateChildAccount(childId: ID): Promise<void>;
  getChildPurchaseHistory(childId: ID): Promise<ChildPurchaseHistoryEntry[]>;
  getChildBaon(childId: ID): Promise<ChildBaonSummary>;
  setChildBaonAllocation(childId: ID, newAllocatedBudget: number): Promise<ChildBaonSummary>;
  /** Parent's wallet balance minus every active child's remaining_budget -- see the Child Accounts/Baon proposal, section 8. */
  getUnallocatedBalance(): Promise<UnallocatedBalanceSummary>;
}

export type { ChildAccountSummary, ChildBaonSummary, ChildPurchaseHistoryEntry, CreateChildAccountInput, UnallocatedBalanceSummary, ISODateString };
