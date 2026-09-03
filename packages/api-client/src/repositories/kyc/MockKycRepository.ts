import type { AssetUploadInput, KycRepository, SubmitKycInput, SubmitKycResult } from "./KycRepository";

const MOCK_DELAY_MS = 400;
function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

let mockAssetCounter = 0;

/** Stands in for XanoKycRepository until an app's own real contract is confirmed. */
export class MockKycRepository implements KycRepository {
  async uploadAsset(_input: AssetUploadInput): Promise<string> {
    mockAssetCounter += 1;
    return delay(`mock-asset-${mockAssetCounter}`);
  }

  async submitIdentity(_input: SubmitKycInput): Promise<SubmitKycResult> {
    return delay({ userId: "mock-user-1", registrationProgress: 60, message: "Identity verification submitted (mock)." });
  }
}
