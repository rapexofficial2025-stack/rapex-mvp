import { useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories, type RegisterInput } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { auth } = useRepositories();
  const [form, setForm] = useState<RegisterInput>({ name: "", email: "", phone: "", password: "" });
  const register = useAsyncAction((input: RegisterInput) => auth.register(input));

  return (
    <ScreenContainer title="Create Account" subtitle="Join RAPEX">
      <Input label="Full Name" value={form.name} onChangeText={(name) => setForm((f) => ({ ...f, name }))} />
      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(email) => setForm((f) => ({ ...f, email }))}
      />
      <Input
        label="Mobile Number"
        keyboardType="phone-pad"
        value={form.phone}
        onChangeText={(phone) => setForm((f) => ({ ...f, phone }))}
      />
      <Input
        label="Password"
        secureTextEntry
        value={form.password}
        onChangeText={(password) => setForm((f) => ({ ...f, password }))}
      />
      {register.error ? <ErrorState description={register.error} /> : null}
      <Button
        label="Continue"
        loading={register.loading}
        onPress={async () => {
          await register.execute(form);
          navigation.navigate("Otp", { destination: "register" });
        }}
      />
      <Button label="Already have an account? Log In" variant="secondary" onPress={() => navigation.navigate("Login")} />
    </ScreenContainer>
  );
}
