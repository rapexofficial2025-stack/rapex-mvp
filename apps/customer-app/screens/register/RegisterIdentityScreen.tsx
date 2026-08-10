import { useState } from "react";
import { Image, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { Button, Badge, ErrorState } from "@rapex/ui-native";
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
 * GAP: there is no confirmed Xano endpoint to upload these images to.
 * Captured URIs are kept locally in registrationStore and shown in
 * ProfileScreen as "captured, not yet submitted" -- exactly like every
 * other unconfirmed-contract field in this codebase, nothing here silently
 * pretends the ID was actually verified server-side.
 */
export function RegisterIdentityScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const draft = useRegistrationDraft();
  const [permissionError, setPermissionError] = useState<string | null>(null);

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

      <Badge label="Captured images are not yet submitted to a verification backend -- endpoint not confirmed" tone="warning" />

      <Button label="Continue" disabled={!canSubmit} onPress={() => navigation.navigate("RegisterContact")} />
    </ScreenContainer>
  );
}
