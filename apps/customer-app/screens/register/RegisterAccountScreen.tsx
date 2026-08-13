import { useState } from "react";
import { Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../../types/navigation";
import { ScreenContainer } from "../../components/ScreenContainer";
import { PickerField } from "../../components/PickerField";
import { useAppTheme } from "../../hooks/useAppTheme";
import { updateRegistrationDraft, useRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const GENDERS = ["Male", "Female", "Prefer not to say"] as const;

/**
 * Registration Step 3 of 7 -- Account. This is the step that actually
 * creates the Xano account: the confirmed `/auth/signup` contract (see
 * XanoAuthRepository) only accepts { name, email, password }, so `name` is
 * assembled from First Name + Surname and Mobile Number/Gender are kept
 * locally in registrationStore for the Profile screen and later steps --
 * they are not silently dropped, but they are also not actually submitted
 * to Xano yet since there's no field for them on this endpoint.
 */
export function RegisterAccountScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { auth } = useRepositories();
  const draft = useRegistrationDraft();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const register = useAsyncAction((input: { name: string; email: string; phone: string; password: string }) =>
    auth.register(input),
  );

  const canSubmit =
    draft.firstName.trim().length > 0 &&
    draft.surname.trim().length > 0 &&
    draft.email.trim().length > 0 &&
    draft.password.length > 0 &&
    draft.mobile.trim().length > 0 &&
    draft.gender !== null;

  return (
    <ScreenContainer title="Create Your Account" subtitle="Step 3 of 7">
      <Input label="First Name" value={draft.firstName} onChangeText={(firstName) => updateRegistrationDraft({ firstName })} />
      <Input label="Surname" value={draft.surname} onChangeText={(surname) => updateRegistrationDraft({ surname })} />
      <Input
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={draft.email}
        onChangeText={(email) => updateRegistrationDraft({ email })}
      />
      <Input
        label="Mobile Number"
        keyboardType="phone-pad"
        value={draft.mobile}
        onChangeText={(mobile) => updateRegistrationDraft({ mobile })}
      />
      <PickerField label="Gender" value={draft.gender} options={[...GENDERS]} onSelect={(gender) => updateRegistrationDraft({ gender: gender as typeof draft.gender })} />
      <Input label="Password" secureTextEntry value={draft.password} onChangeText={(password) => updateRegistrationDraft({ password })} />
      <Input label="Confirm Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

      {validationError ? <Text style={{ color: theme.colors.error, fontSize: theme.typography.fontSize.sm }}>{validationError}</Text> : null}
      {register.error ? <ErrorState description={register.error} onRetry={() => setValidationError(null)} /> : null}

      <Button
        label="Continue"
        loading={register.loading}
        disabled={!canSubmit}
        onPress={async () => {
          setValidationError(null);
          if (draft.password !== confirmPassword) {
            setValidationError("Passwords do not match.");
            return;
          }
          const name = `${draft.firstName.trim()} ${draft.surname.trim()}`.trim();
          await register.execute({ name, email: draft.email, phone: draft.mobile, password: draft.password });
          updateRegistrationDraft({ authProvider: "password" });
          navigation.navigate("RegisterSuccess");
        }}
      />
      <Button label="Already have an account? Log In" variant="secondary" onPress={() => navigation.navigate("Login")} />
    </ScreenContainer>
  );
}
