import type { RiderAvailabilityStatus, RiderDocument, RiderEligibility, RiderPerformance, RiderProfile } from "../types";

export type UpdateRiderProfileInput = Partial<
  Pick<
    RiderProfile,
    "fullName" | "phone" | "email" | "address" | "barangay" | "municipality" | "province" | "vehicleType" | "plateNumber"
  >
>;

export interface RiderRepository {
  getProfile(): Promise<RiderProfile>;
  updateProfile(input: UpdateRiderProfileInput): Promise<RiderProfile>;
  uploadDocument(document: RiderDocument): Promise<RiderProfile>;
  setAvailabilityStatus(status: RiderAvailabilityStatus): Promise<RiderProfile>;
  setLocationPermission(enabled: boolean): Promise<RiderProfile>;
  /** Admin verification approval conditions -- verified, location on, wallet active, not suspended, online. */
  checkAssignmentEligibility(): Promise<RiderEligibility>;
  getPerformance(): Promise<RiderPerformance>;
}
