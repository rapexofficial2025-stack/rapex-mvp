import { useState } from "react";
import { Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

/**
 * Real Xano endpoint (GET /reset/request-reset-link?identifier=...) --
 * accepts email, mobile, or full name and emails a reset link to the
 * matched account. There's no confirmed in-app "enter new password" step
 * (Xano's spec only covers sending the link), so this screen's job ends at
 * "check your email" -- completing the reset happens via whatever the
 * emailed link opens, not in this app.
 */
export function ForgotPasswordScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const [identifier, setIdentifier] = useState("");
  const [sent, setSent] = useState(false);
  const request = useAsyncAction((value: string) => auth.requestPasswordReset(value));

  return (
    <ScreenContainer title="Forgot Password" subtitle="Enter your email, mobile number, or full name">
      {sent ? (
        <Text style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>
          If that account exists, a password reset link has been sent to its registered email.
        </Text>
      ) : (
        <>
          <Input label="Email, Mobile, or Full Name" autoCapitalize="none" value={identifier} onChangeText={setIdentifier} />
          {request.error ? <ErrorState description={request.error} /> : null}
          <Button
            label="Send Reset Link"
            loading={request.loading}
            disabled={identifier.trim().length === 0}
            onPress={async () => {
              await request.execute(identifier.trim());
              setSent(true);
            }}
          />
        </>
      )}
      <Button label="Back to Log In" variant="secondary" onPress={() => navigation.navigate("Login")} />
    </ScreenContainer>
  );
}
