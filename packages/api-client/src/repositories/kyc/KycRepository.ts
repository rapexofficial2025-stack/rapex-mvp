/**
 * Identity verification (KYC) -- confirmed Xano contracts (2026-08-14
 * handover), both real, two-step:
 *
 *   POST /super_app/assets/upload            (multipart file upload) -> asset_id
 *   POST /rapex-auth/submit-kyc               (Bearer, requires a session)
 *     body: { id_type, id_front_id, id_back_id, selfie_id }
 *     -> { user_id, registration_progress, message }
 *     current backend behavior: identity_status = pending, registration_progress = 60
 *
 * Separate from AuthRepository on purpose -- identity verification is a
 * distinct domain from authentication itself (same split as Orders/Wallet/
 * Merchant, all of which also need a Bearer token but aren't part of
 * AuthRepository), not a "parallel auth system".
 */
export type SubmitKycInput = {
  idType: string;
  idFrontAssetId: string;
  idBackAssetId: string;
  selfieAssetId: string;
};

export type SubmitKycResult = {
  userId: string;
  registrationProgress: number;
  message: string;
};

export interface KycRepository {
  /** Uploads one image (ID front/back or selfie) and returns the asset_id to reference in submitIdentity(). */
  uploadAsset(input: { uri: string; fileName: string; mimeType: string }): Promise<string>;
  /** Requires an authenticated session (Bearer token) -- caller must already be logged in. */
  submitIdentity(input: SubmitKycInput): Promise<SubmitKycResult>;
}
