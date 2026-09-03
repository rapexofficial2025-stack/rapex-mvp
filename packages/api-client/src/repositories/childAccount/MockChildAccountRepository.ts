import type { ID } from "@rapex/types";
import type { ChildAccountRepository } from "./ChildAccountRepository";
import type { ChildAccountSummary, ChildBaonSummary, ChildPurchaseHistoryEntry, CreateChildAccountInput, UnallocatedBalanceSummary } from "../types";

const MOCK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

/** Stands in for the parent's real, single actual wallet until Xano's wallet endpoint is Child-aware. */
let parentWalletBalance = 1500;

let nextId = 1;
const accounts: ChildAccountSummary[] = [];
const baonByChildId = new Map<ID, ChildBaonSummary>();
const purchaseHistoryByChildId = new Map<ID, ChildPurchaseHistoryEntry[]>();

function committedToOtherChildren(excludeChildId?: ID): number {
  let total = 0;
  for (const [childId, baon] of baonByChildId) {
    if (childId === excludeChildId) continue;
    total += baon.remainingBudget;
  }
  return total;
}

/** Stands in for the real Xano-backed ChildAccountRepository until that API contract is provided. See the Child Accounts/Baon proposal for the intended real endpoints. */
export class MockChildAccountRepository implements ChildAccountRepository {
  async listChildAccounts(): Promise<ChildAccountSummary[]> {
    return delay([...accounts]);
  }

  async getChildAccount(childId: ID): Promise<ChildAccountSummary> {
    const account = accounts.find((a) => a.id === childId);
    if (!account) throw new Error("Child account not found.");
    return delay(account);
  }

  async createChildAccount(input: CreateChildAccountInput): Promise<ChildAccountSummary> {
    if (!input.parentAuthorizationConfirmed) {
      throw new Error("Parent authorization is required to create a Child Account.");
    }
    if (input.isStudent && !input.studentVerificationRef) {
      throw new Error("Student ID/verification is required when Student = Yes.");
    }
    if (!input.isStudent && (!input.nonStudentReason || !input.intendedUsePurpose)) {
      throw new Error("Reason and intended use are required when Student = No.");
    }

    const account: ChildAccountSummary = {
      id: `child-${nextId++}`,
      fullName: input.fullName,
      email: input.email,
      dateOfBirth: input.dateOfBirth,
      gender: input.gender,
      status: "active",
      isStudent: input.isStudent,
      createdAt: new Date().toISOString(),
    };
    accounts.push(account);
    baonByChildId.set(account.id, { childId: account.id, allocatedBudget: 0, spentAmount: 0, remainingBudget: 0 });
    purchaseHistoryByChildId.set(account.id, []);
    return delay(account);
  }

  async deactivateChildAccount(childId: ID): Promise<void> {
    const account = accounts.find((a) => a.id === childId);
    if (!account) throw new Error("Child account not found.");
    account.status = "inactive";
    await delay(undefined);
  }

  async reactivateChildAccount(childId: ID): Promise<void> {
    const account = accounts.find((a) => a.id === childId);
    if (!account) throw new Error("Child account not found.");
    account.status = "active";
    await delay(undefined);
  }

  async getChildPurchaseHistory(childId: ID): Promise<ChildPurchaseHistoryEntry[]> {
    return delay([...(purchaseHistoryByChildId.get(childId) ?? [])]);
  }

  async getChildBaon(childId: ID): Promise<ChildBaonSummary> {
    const baon = baonByChildId.get(childId);
    if (!baon) throw new Error("Child account not found.");
    return delay(baon);
  }

  async setChildBaonAllocation(childId: ID, newAllocatedBudget: number): Promise<ChildBaonSummary> {
    const baon = baonByChildId.get(childId);
    if (!baon) throw new Error("Child account not found.");
    if (newAllocatedBudget < baon.spentAmount) {
      throw new Error("Allocation cannot be set below the amount this child has already spent.");
    }
    // Over-allocation guard -- see proposal section 8's formula.
    const newRemaining = newAllocatedBudget - baon.spentAmount;
    if (newRemaining + committedToOtherChildren(childId) > parentWalletBalance) {
      throw new Error("This allocation exceeds your unallocated wallet balance.");
    }
    const updated: ChildBaonSummary = { ...baon, allocatedBudget: newAllocatedBudget, remainingBudget: newRemaining };
    baonByChildId.set(childId, updated);
    return delay(updated);
  }

  async getUnallocatedBalance(): Promise<UnallocatedBalanceSummary> {
    const totalCommittedToChildren = committedToOtherChildren();
    return delay({
      walletBalance: parentWalletBalance,
      totalCommittedToChildren,
      availableToAllocate: parentWalletBalance - totalCommittedToChildren,
    });
  }
}
