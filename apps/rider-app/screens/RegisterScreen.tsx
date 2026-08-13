import { useState } from "react";
import { Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

/** Account is created pending Admin approval -- no session yet, so this returns straight to Login, not the app. */
export function RegisterScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const register = useAsyncAction(() => auth.register({ email, password, role: "rider", firstName, lastName, mobile }));

  if (submitted) {
    return (
      <ScreenContainer title="Application Submitted" subtitle="Start earning with RAPEX">
        <Text style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>
          Your rider account is pending Admin approval. You'll be able to log in once it's approved.
        </Text>
        <Button label="Back to Log In" onPress={() => navigation.navigate("Login")} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="Create Rider Account" subtitle="Start earning with RAPEX">
      <Input label="First Name" value={firstName} onChangeText={setFirstName} />
      <Input label="Last Name" value={lastName} onChangeText={setLastName} />
      <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input label="Mobile Number" keyboardType="phone-pad" value={mobile} onChangeText={setMobile} />
      <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {register.error ? <ErrorState description={register.error} /> : null}
      <Button
        label="Continue"
        loading={register.loading}
        onPress={async () => {
          await register.execute();
          setSubmitted(true);
        }}
      />
      <Button label="Already have an account? Log In" variant="secondary" onPress={() => navigation.navigate("Login")} />
    </ScreenContainer>
  );
}
