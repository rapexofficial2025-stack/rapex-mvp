import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Otp">;

/** Completes login: verifies the 6-digit code emailed after Login's password check (see LoginScreen, XanoAuthRepository). */
export function OtpScreen({ navigation }: Props) {
  const { auth } = useRepositories();
  const [code, setCode] = useState("");
  const verify = useAsyncAction((otpCode: string) => auth.verifyOtp(otpCode));

  return (
    <ScreenContainer title="Enter OTP" subtitle="Verification code sent to your registered email">
      <Input label="6-digit code" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode} />
      {verify.error ? <ErrorState description={verify.error} onRetry={() => setCode("")} /> : null}
      <Button
        label="Verify"
        loading={verify.loading}
        onPress={async () => {
          await verify.execute(code);
          const nextStep = await auth.getNextStep();
          switch (nextStep) {
            case "PRIVACY_TERMS":
              navigation.replace("PrivacyTerms");
              break;
            case "REGISTRATION":
              navigation.replace("PrivacyTerms");
              break;
            case "WELCOME_ANIMATION":
              navigation.replace("WelcomeVideo");
              break;
            case "PROFILE_SETUP":
              navigation.replace("Profile");
              break;
            default:
              navigation.replace("MainTabs");
          }
        }}
      />
      <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
}
