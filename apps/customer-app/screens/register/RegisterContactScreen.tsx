import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Badge } from "@rapex/ui-native";
import type { RootStackParamList } from "../../types/navigation";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAppTheme } from "../../hooks/useAppTheme";
import { updateRegistrationDraft, useRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterContact">;

/**
 * Registration Step 5 of 7 -- Contact Verification.
 *
 * The Master Authentication Suite (see XanoAuthRepository) has no
 * registration-time mobile-OTP endpoint -- the old generic /verify/send-code
 * pair this screen used was one of the duplicated auth endpoints that got
 * removed. Both mobile and email are shown honestly as manual "I've
 * verified..." acknowledgements rather than inventing a fake API call;
 * real verification for the account as a whole happens via the Login OTP
 * step and Admin approval.
 *
 * Google/Facebook: if the account was created via OAuth (Step 3's
 * authProvider), both contact methods are treated as already verified by
 * the provider -- per instruction, don't ask the user to manually re-enter
 * or re-verify a provider-supplied email.
 */
export function RegisterContactScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const draft = useRegistrationDraft();

  const isOAuth = draft.authProvider === "google" || draft.authProvider === "facebook";
  const canContinue = isOAuth || (draft.mobileVerified && draft.emailVerified);

  return (
    <ScreenContainer title="Verify Your Contact Details" subtitle="Step 5 of 7">
      {isOAuth ? (
        <Badge label={`Verified automatically via ${draft.authProvider === "google" ? "Google" : "Facebook"}`} tone="success" />
      ) : (
        <>
          <View style={{ gap: theme.spacing.xs }}>
            <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Mobile Number</Text>
            <Text style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>{draft.mobile || "Not set"}</Text>
            {draft.mobileVerified ? (
              <Badge label="Verified" tone="success" />
            ) : (
              <>
                <Badge label="Registration-time mobile OTP not confirmed with backend -- manual acknowledgement" tone="warning" />
                <Button
                  label="I've Verified My Mobile Number"
                  variant="outline"
                  onPress={() => updateRegistrationDraft({ mobileVerified: true })}
                />
              </>
            )}
          </View>

          <View style={{ gap: theme.spacing.xs }}>
            <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>Email</Text>
            <Text style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>{draft.email || "Not set"}</Text>
            {draft.emailVerified ? (
              <Badge label="Verified" tone="success" />
            ) : (
              <>
                <Badge label="Verification email flow not confirmed with backend -- manual acknowledgement" tone="warning" />
                <Button
                  label="I've Verified My Email"
                  variant="outline"
                  onPress={() => updateRegistrationDraft({ emailVerified: true })}
                />
              </>
            )}
          </View>
        </>
      )}

      <Button label="Continue" disabled={!canContinue} onPress={() => navigation.navigate("RegisterLocation")} />
    </ScreenContainer>
  );
}
