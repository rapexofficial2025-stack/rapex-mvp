import { useRepositories } from "../RepositoryProvider";
import { useAsync, type AsyncState } from "./useAsync";
import type { RiderPerformance, RiderProfile } from "../repositories/types";

function requireRider() {
  const { rider } = useRepositories();
  if (!rider) throw new Error("RiderRepository is not configured on this app's RepositoryProvider.");
  return rider;
}

export function useRiderProfile(): AsyncState<RiderProfile> {
  const rider = requireRider();
  return useAsync(() => rider.getProfile(), []);
}

export function useRiderPerformance(): AsyncState<RiderPerformance> {
  const rider = requireRider();
  return useAsync(() => rider.getPerformance(), []);
}
