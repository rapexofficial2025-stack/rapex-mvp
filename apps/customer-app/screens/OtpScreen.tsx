import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { updateRegistrationDraft } from "../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "Otp">;

export function OtpScreen({ navigation, route }: Props) {
  const { auth } = useRepositories();
  const [code, setCode] = useState("");
  const verify = useAsyncAction((otpCode: string) => auth.verifyOtp(route.params.destination, otpCode));

  return (
    <ScreenContainer title="Enter OTP" subtitle="Verification code sent to your mobile number">
      <Input label="6-digit code" keyboardType="number-pad" value={code} onChangeText={setCode} />
      {verify.error ? <ErrorState description={verify.error} onRetry={() => setCode("")} /> : null}
      <Button
        label="Verify"
        loading={verify.loading}
        onPress={async () => {
          await verify.execute(code);
          if (route.params.destination === "register-mobile") {
            updateRegistrationDraft({ mobileVerified: true });
            navigation.goBack();
          } else {
            navigation.replace("MainTabs");
          }
        }}
      />
      <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
}
