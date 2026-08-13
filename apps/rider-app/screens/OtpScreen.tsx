import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Otp">;

/** Completes login: verifies the 6-digit code emailed after Login's password check. */
export function OtpScreen({ navigation }: Props) {
  const { auth } = useRepositories();
  const [code, setCode] = useState("");
  const verify = useAsyncAction((otpCode: string) => auth.verifyOtp(otpCode));

  return (
    <ScreenContainer title="Verify It's You" subtitle="Enter the 6-digit code sent to your registered email">
      <Input label="6-digit code" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode} />
      {verify.error ? <ErrorState description={verify.error} /> : null}
      <Button
        label="Verify"
        loading={verify.loading}
        onPress={async () => {
          await verify.execute(code);
          navigation.replace("MainTabs");
        }}
      />
    </ScreenContainer>
  );
}
