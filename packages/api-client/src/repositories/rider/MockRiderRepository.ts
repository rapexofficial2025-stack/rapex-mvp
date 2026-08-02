import { computeRiderPerformance } from "@rapex/utils";
import type { RiderRepository, UpdateRiderProfileInput } from "./RiderRepository";
import type { RiderAvailabilityStatus, RiderDocument, RiderEligibility, RiderPerformance, RiderProfile } from "../types";

const MOCK_DELAY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

let profile: RiderProfile = {
  id: "rider-1",
  fullName: "Marco Villanueva",
  profilePhotoLabel: "rider-avatar-1",
  birthday: "1998-04-12T00:00:00.000Z",
  age: 28,
  phone: "09171234567",
  email: "marco.rider@example.com",
  address: "123 Aguinaldo Hwy",
  barangay: "Bayan Luma",
  municipality: "Imus",
  province: "Cavite",
  vehicleType: "motorcycle",
  plateNumber: "NBC-1234",
  verificationStatus: "verified",
  availabilityStatus: "offline",
  locationPermissionEnabled: true,
  documents: [
    { type: "driver-license", imageLabel: "doc-license-1", uploadedAt: "2026-06-01T08:00:00.000Z" },
    { type: "valid-id", imageLabel: "doc-id-1", uploadedAt: "2026-06-01T08:00:00.000Z" },
    { type: "selfie-with-id", imageLabel: "doc-selfie-1", uploadedAt: "2026-06-01T08:01:00.000Z" },
  ],
  rating: 4.86,
  walletEligible: true,
  createdAt: "2026-05-15T00:00:00.000Z",
};

const MOCK_PERFORMANCE_RAW = {
  totalOffersReceived: 412,
  totalOffersAccepted: 378,
  totalDeliveriesStarted: 378,
  totalDeliveriesCompleted: 361,
  totalDeliveriesCancelled: 12,
  totalRatingSum: 1717.6,
  totalRatingCount: 353,
  totalDeliveryMinutesSum: 361 * 22,
};

/** Stands in for the real Xano-backed RiderRepository until that API contract is provided. */
export class MockRiderRepository implements RiderRepository {
  async getProfile(): Promise<RiderProfile> {
    return delay(profile);
  }

  async updateProfile(input: UpdateRiderProfileInput): Promise<RiderProfile> {
    profile = { ...profile, ...input };
    return delay(profile);
  }

  async uploadDocument(document: RiderDocument): Promise<RiderProfile> {
    profile = {
      ...profile,
      documents: [...profile.documents.filter((d) => d.type !== document.type), document],
    };
    return delay(profile);
  }

  async setAvailabilityStatus(status: RiderAvailabilityStatus): Promise<RiderProfile> {
    profile = { ...profile, availabilityStatus: status };
    return delay(profile);
  }

  async setLocationPermission(enabled: boolean): Promise<RiderProfile> {
    profile = { ...profile, locationPermissionEnabled: enabled };
    return delay(profile);
  }

  async checkAssignmentEligibility(): Promise<RiderEligibility> {
    const reasons: string[] = [];
    if (profile.verificationStatus !== "verified") reasons.push("Account is not verified yet.");
    if (profile.verificationStatus === "suspended") reasons.push("Account is suspended.");
    if (!profile.locationPermissionEnabled) reasons.push("Location permission is disabled.");
    if (!profile.walletEligible) reasons.push("Wallet is not active.");
    return delay({ eligible: reasons.length === 0, reasons });
  }

  async getPerformance(): Promise<RiderPerformance> {
    const computed = computeRiderPerformance(MOCK_PERFORMANCE_RAW);
    return delay({
      ...computed,
      lifetimeEarnings: 128450.5,
      lifetimeDeliveries: MOCK_PERFORMANCE_RAW.totalDeliveriesCompleted,
    });
  }
}
