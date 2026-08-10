import { Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Badge, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../../types/navigation";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAppTheme } from "../../hooks/useAppTheme";
import { updateRegistrationDraft, useRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterContact">;

/**
 * Registration Step 5 of 7 -- Contact Verification.
 *
 * Mobile: wired to the real, confirmed Xano flow -- POST /verify/send-code
 * then POST /verify-otp (Bearer-authed with the token from Step 3's
 * register() call) via the existing auth.requestOtp/verifyOtp.
 *
 * Email: Xano's contract exposes no separate confirmed
 * email-verification-link endpoint (send-code/verify-otp is a single
 * generic pair, presumed to be for the mobile number based on its naming --
 * not confirmed which contact method it actually targets either). Shown
 * honestly as a manual "I've verified my email" acknowledgement rather than
 * inventing a fake email API call.
 *
 * Google/Facebook: if the account was created via OAuth (Step 3's
 * authProvider), both contact methods are treated as already verified by
 * the provider -- per instruction, don't ask the user to manually re-enter
 * or re-verify a provider-supplied email.
 */
export function RegisterContactScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const draft = useRegistrationDraft();
  const requestOtp = useAsyncAction(() => auth.requestOtp("register-mobile"));

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
                {requestOtp.error ? <ErrorState description={requestOtp.error} onRetry={() => requestOtp.execute()} /> : null}
                <Button
                  label="Send OTP"
                  loading={requestOtp.loading}
                  onPress={async () => {
                    await requestOtp.execute();
                    navigation.navigate("Otp", { destination: "register-mobile" });
                  }}
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
