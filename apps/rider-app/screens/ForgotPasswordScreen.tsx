import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { auth } = useRepositories();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const request = useAsyncAction((destination: string) => auth.requestOtp(destination));

  return (
    <ScreenContainer title="Forgot Password" subtitle="We'll send a reset code to your email">
      <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      {request.error ? <ErrorState description={request.error} /> : null}
      {sent ? null : (
        <Button
          label="Send Reset Code"
          loading={request.loading}
          onPress={async () => {
            await request.execute(email);
            setSent(true);
          }}
        />
      )}
      {sent ? (
        <Button label="Enter Reset Code" onPress={() => navigation.navigate("Otp", { destination: email, channel: "email" })} />
      ) : null}
      <Button label="Back to Log In" variant="secondary" onPress={() => navigation.navigate("Login")} />
    </ScreenContainer>
  );
}
