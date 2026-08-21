import type { HttpClient } from "../../core/httpClient";
import type { AssetUploadInput, KycRepository, SubmitKycInput, SubmitKycResult } from "./KycRepository";

/**
 * Real Xano-backed KycRepository (2026-08-14 handover). Two Xano groups:
 * `super_app` for the generic asset upload, `rapex-auth` for submit-kyc
 * itself (same group/client as the rest of AuthRepository, injected
 * separately here rather than added to AuthRepository -- see this file's
 * sibling KycRepository.ts doc comment for why).
 *
 * ASSUMPTION flagged for Xano confirmation: the multipart field name
 * `/super_app/assets/upload` expects isn't specified in the handover --
 * using "file" as the most common default. The upload response's asset id
 * field is assumed to be `asset_id` (matches how submit-kyc's own request
 * body names it: id_front_id/id_back_id/selfie_id), with `id` tried as a
 * fallback.
 */
export class XanoKycRepository implements KycRepository {
  private readonly superAppClient: HttpClient;
  private readonly authClient: HttpClient;

  constructor(superAppClient: HttpClient, authClient: HttpClient) {
    this.superAppClient = superAppClient;
    this.authClient = authClient;
  }

  async uploadAsset(input: AssetUploadInput): Promise<string> {
    const formData = new FormData();
    if (typeof File !== "undefined" && input instanceof File) {
      // Browser <input type="file"> gives a real File -- standard web FormData usage.
      formData.append("file", input, input.name);
    } else {
      // React Native's fetch/FormData accepts this {uri, name, type} shape
      // directly for a local file URI -- not a real Blob/File, this is the
      // standard RN pattern.
      const rn = input as { uri: string; fileName: string; mimeType: string };
      formData.append("file", { uri: rn.uri, name: rn.fileName, type: rn.mimeType } as unknown as Blob);
    }

    const result = await this.superAppClient.request<{ asset_id?: string | number; id?: string | number }>({
      path: "/assets/upload",
      method: "POST",
      body: formData,
    });

    const assetId = result?.asset_id ?? result?.id;
    if (!assetId) {
      throw new Error("Xano did not return an asset_id for the uploaded file.");
    }
    return String(assetId);
  }

  async submitIdentity(input: SubmitKycInput): Promise<SubmitKycResult> {
    const result = await this.authClient.request<{ user_id?: string | number; registration_progress?: number; message?: string }>({
      path: "/submit-kyc",
      method: "POST",
      body: {
        id_type: input.idType,
        id_front_id: input.idFrontAssetId,
        id_back_id: input.idBackAssetId,
        selfie_id: input.selfieAssetId,
      },
    });

    return {
      userId: String(result?.user_id ?? ""),
      registrationProgress: result?.registration_progress ?? 0,
      message: result?.message ?? "",
    };
  }
}
