import { useRepositories } from "../RepositoryProvider";
import { useAsync, type AsyncState } from "./useAsync";
import { useAsyncAction, type AsyncActionState } from "./useAsyncAction";
import type {
  AdminAccessGrant,
  AdminOrderRecord,
  CurrentAdmin,
  CustomerSummary,
  DashboardOverview,
  EngineChangeLogEntry,
  EngineKey,
  EngineTierRule,
  PendingMerchantApproval,
  PlatformStats,
  VerificationApplicant,
} from "../repositories/types";
import type {
  CreateEngineTierInput,
  GrantEngineAccessInput,
  UpdateEngineTierInput,
} from "../repositories/admin/AdminRepository";

export function useCurrentAdmin(): AsyncState<CurrentAdmin> {
  const { admin } = useRepositories();
  return useAsync(() => admin.getCurrentAdmin(), []);
}

export function usePendingMerchantApprovals(): AsyncState<PendingMerchantApproval[]> {
  const { admin } = useRepositories();
  return useAsync(() => admin.getPendingMerchantApprovals(), []);
}

export function useCustomers(): AsyncState<CustomerSummary[]> {
  const { admin } = useRepositories();
  return useAsync(() => admin.getCustomers(), []);
}

export function usePlatformStats(): AsyncState<PlatformStats> {
  const { admin } = useRepositories();
  return useAsync(() => admin.getPlatformStats(), []);
}

export function useEngineTiers(engineKey: EngineKey): AsyncState<EngineTierRule[]> {
  const { admin } = useRepositories();
  return useAsync(() => admin.getEngineTiers(engineKey), [engineKey]);
}

export function useEngineHistory(engineKey: EngineKey): AsyncState<EngineChangeLogEntry[]> {
  const { admin } = useRepositories();
  return useAsync(() => admin.getEngineHistory(engineKey), [engineKey]);
}

export function useCreateEngineTierAction(): AsyncActionState<[EngineKey, CreateEngineTierInput], EngineTierRule> {
  const { admin } = useRepositories();
  return useAsyncAction((engineKey: EngineKey, input: CreateEngineTierInput) => admin.createEngineTier(engineKey, input));
}

export function useUpdateEngineTierAction(): AsyncActionState<[string, UpdateEngineTierInput], EngineTierRule> {
  const { admin } = useRepositories();
  return useAsyncAction((tierId: string, input: UpdateEngineTierInput) => admin.updateEngineTier(tierId, input));
}

export function useDeleteEngineTierAction(): AsyncActionState<[string], void> {
  const { admin } = useRepositories();
  return useAsyncAction((tierId: string) => admin.deleteEngineTier(tierId));
}

export function useEngineAccessGrants(): AsyncState<AdminAccessGrant[]> {
  const { admin } = useRepositories();
  return useAsync(() => admin.getEngineAccessGrants(), []);
}

export function useGrantEngineAccessAction(): AsyncActionState<[GrantEngineAccessInput], AdminAccessGrant> {
  const { admin } = useRepositories();
  return useAsyncAction((input: GrantEngineAccessInput) => admin.grantEngineAccess(input));
}

export function useRevokeEngineAccessAction(): AsyncActionState<[string], void> {
  const { admin } = useRepositories();
  return useAsyncAction((grantId: string) => admin.revokeEngineAccess(grantId));
}

export function useAdminOrderFinancials(): AsyncState<AdminOrderRecord[]> {
  const { admin } = useRepositories();
  return useAsync(() => admin.getOrderFinancials(), []);
}

export function useDashboardOverview(): AsyncState<DashboardOverview> {
  const { admin } = useRepositories();
  return useAsync(() => admin.getDashboardOverview(), []);
}

export function useVerificationQueue(): AsyncState<VerificationApplicant[]> {
  const { admin } = useRepositories();
  return useAsync(() => admin.getVerificationQueue(), []);
}

export function useApproveApplicantAction(): AsyncActionState<[string], void> {
  const { admin } = useRepositories();
  return useAsyncAction((applicantId: string) => admin.approveApplicant(applicantId));
}

export function useRejectApplicantAction(): AsyncActionState<[string], void> {
  const { admin } = useRepositories();
  return useAsyncAction((applicantId: string) => admin.rejectApplicant(applicantId));
}
