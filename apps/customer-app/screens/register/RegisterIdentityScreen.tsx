import { useState } from "react";
import { Image, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { Button, Badge, ErrorState } from "@rapex/ui-native";
import { useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../../types/navigation";
import { ScreenContainer } from "../../components/ScreenContainer";
import { PickerField } from "../../components/PickerField";
import { useAppTheme } from "../../hooks/useAppTheme";
import { updateRegistrationDraft, useRegistrationDraft, type IdDocumentType } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterIdentity">;

const ID_TYPES: IdDocumentType[] = ["National ID", "Driver's License", "Passport", "UMID", "PhilHealth ID", "Voter's ID"];

type CaptureKey = "idFrontUri" | "idBackUri" | "selfieUri";

const CAPTURES: { key: CaptureKey; label: string; helper: string }[] = [
  { key: "idFrontUri", label: "Government ID -- Front", helper: "Make sure all text is clear and readable." },
  { key: "idBackUri", label: "Government ID -- Back", helper: "Capture the back of the same ID." },
  { key: "selfieUri", label: "Selfie With ID", helper: "Hold your ID next to your face, both clearly visible." },
];

/**
 * Registration Step 4 of 7 -- Identity/KYC. Camera-only capture per
 * instruction (no gallery/file upload) -- launchCameraAsync opens the
 * device camera directly, never a photo library picker.
 *
 * Real submission (2026-08-14 Xano handover): each image is uploaded via
 * `POST /super_app/assets/upload` to get an asset_id, then all three
 * asset_ids go to `POST /rapex-auth/submit-kyc`. Requires an authenticated
 * session -- this screen is only reachable from Profile's setup checklist
 * (post-login), so a session always exists by the time a user gets here.
 * Real backend behavior on success: identity_status becomes `pending`,
 * registration_progress becomes 60 -- this is a submission for review, not
 * an instant verification, and nothing here claims otherwise.
 */
export function RegisterIdentityScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const draft = useRegistrationDraft();
  const { kyc } = useRepositories();
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function capture(key: CaptureKey) {
    setPermissionError(null);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setPermissionError("Camera access is required to capture your ID and selfie. Please allow camera access in your device settings.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
      cameraType: key === "selfieUri" ? ImagePicker.CameraType.front : ImagePicker.CameraType.back,
    });
    if (result.canceled || result.assets.length === 0) return;
    updateRegistrationDraft({ [key]: result.assets[0].uri });
  }

  const allCaptured = draft.idFrontUri && draft.idBackUri && draft.selfieUri;
  const canSubmit = draft.idType !== null && allCaptured;

  async function submitKyc() {
    if (!draft.idType || !draft.idFrontUri || !draft.idBackUri || !draft.selfieUri) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const [idFrontAssetId, idBackAssetId, selfieAssetId] = await Promise.all([
        kyc!.uploadAsset({ uri: draft.idFrontUri, fileName: "id-front.jpg", mimeType: "image/jpeg" }),
        kyc!.uploadAsset({ uri: draft.idBackUri, fileName: "id-back.jpg", mimeType: "image/jpeg" }),
        kyc!.uploadAsset({ uri: draft.selfieUri, fileName: "selfie.jpg", mimeType: "image/jpeg" }),
      ]);
      await kyc!.submitIdentity({ idType: draft.idType, idFrontAssetId, idBackAssetId, selfieAssetId });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Couldn't submit your identity documents. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer title="Verify Your Identity" subtitle="Step 4 of 7 -- Camera capture only">
      <PickerField label="Government ID Type" value={draft.idType} options={ID_TYPES} onSelect={(idType) => updateRegistrationDraft({ idType: idType as IdDocumentType })} />

      {permissionError ? <ErrorState description={permissionError} /> : null}

      {CAPTURES.map(({ key, label, helper }) => (
        <View key={key} style={{ gap: theme.spacing.xs }}>
          <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{label}</Text>
          <Text style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textDisabled }}>{helper}</Text>
          {draft[key] ? (
            <View style={{ gap: theme.spacing.xs }}>
              <Image source={{ uri: draft[key]! }} style={{ width: "100%", height: 160, borderRadius: theme.radius.md }} resizeMode="cover" />
              <Badge label="Captured" tone="success" />
              <Button label="Retake" variant="outline" size="sm" onPress={() => capture(key)} />
            </View>
          ) : (
            <Button label={`Open Camera -- ${label}`} variant="outline" onPress={() => capture(key)} disabled={!draft.idType} />
          )}
        </View>
      ))}

      {submitted ? (
        <Badge label="Submitted -- under review (identity_status: pending)" tone="success" />
      ) : (
        <Badge label="Not yet submitted for verification" tone="warning" />
      )}
      {submitError ? <ErrorState description={submitError} onRetry={submitKyc} /> : null}

      {submitted ? (
        <Button label="Continue" onPress={() => navigation.navigate("RegisterContact")} />
      ) : (
        <Button label="Submit for Verification" loading={submitting} disabled={!canSubmit} onPress={submitKyc} />
      )}
    </ScreenContainer>
  );
}
