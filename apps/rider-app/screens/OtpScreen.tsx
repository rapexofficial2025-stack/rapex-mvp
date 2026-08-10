import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Otp">;

export function OtpScreen({ navigation, route }: Props) {
  const { auth } = useRepositories();
  const { destination, channel } = route.params;
  const [code, setCode] = useState("");
  const verify = useAsyncAction((otpCode: string) => auth.verifyOtp(destination, otpCode));
  const resend = useAsyncAction(() => auth.requestOtp(destination));

  return (
    <ScreenContainer
      title={channel === "email" ? "Verify Email" : "Verify Phone"}
      subtitle={`Enter the 6-digit code sent to ${destination}`}
    >
      <Input label="6-digit code" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode} />
      {verify.error ? <ErrorState description={verify.error} /> : null}
      <Button
        label="Verify"
        loading={verify.loading}
        onPress={async () => {
          const session = await verify.execute(code);
          if (channel === "email") {
            navigation.navigate("Otp", { destination: session.user.phone, channel: "phone" });
          } else {
            navigation.navigate("Verification");
          }
        }}
      />
      <Button label="Resend Code" variant="secondary" loading={resend.loading} onPress={() => resend.execute()} />
    </ScreenContainer>
  );
}
