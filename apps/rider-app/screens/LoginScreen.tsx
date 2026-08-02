import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { auth } = useRepositories();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));

  return (
    <ScreenContainer title="Rider Log In" subtitle="Welcome back to RAPEX">
      <Input label="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <Input label="Password" secureTextEntry value={password} onChangeText={setPassword} />
      {login.error ? <ErrorState description={login.error} /> : null}
      <Button
        label="Log In"
        loading={login.loading}
        onPress={async () => {
          await login.execute({ email, password });
          navigation.navigate("MainTabs");
        }}
      />
      <Button label="Forgot password?" variant="secondary" onPress={() => navigation.navigate("ForgotPassword")} />
      <Button label="Don't have an account? Register" variant="outline" onPress={() => navigation.navigate("Register")} />
    </ScreenContainer>
  );
}
