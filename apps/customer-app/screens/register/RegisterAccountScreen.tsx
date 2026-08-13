import { useState } from "react";
import { Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Input, Button } from "@rapex/ui-native";
import type { RootStackParamList } from "../../types/navigation";
import { ScreenContainer } from "../../components/ScreenContainer";
import { PickerField } from "../../components/PickerField";
import { useAppTheme } from "../../hooks/useAppTheme";
import { updateRegistrationDraft, useRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

const GENDERS = ["Male", "Female", "Prefer not to say"] as const;

/**
 * Registration Step 3 of 7 -- Account. Local field collection only -- the
 * real `/auth/signup` call (Master Authentication Suite, see
 * XanoAuthRepository) needs the full address gathered in the later
 * Location/Address steps too, so it fires once at the end of the wizard
 * (AddressScreen/RegisterLocationScreen), not here.
 */
export function RegisterAccountScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const draft = useRegistrationDraft();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

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

      <Button
        label="Continue"
        disabled={!canSubmit}
        onPress={() => {
          setValidationError(null);
          if (draft.password !== confirmPassword) {
            setValidationError("Passwords do not match.");
            return;
          }
          updateRegistrationDraft({ authProvider: "password" });
          navigation.navigate("RegisterIdentity");
        }}
      />
      <Button label="Already have an account? Log In" variant="secondary" onPress={() => navigation.navigate("Login")} />
    </ScreenContainer>
  );
}
