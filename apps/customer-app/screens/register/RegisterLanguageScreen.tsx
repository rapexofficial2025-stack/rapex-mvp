import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@rapex/ui-native";
import type { RootStackParamList } from "../../types/navigation";
import { ScreenContainer } from "../../components/ScreenContainer";
import { updateRegistrationDraft, useRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterLanguage">;

/** Registration Step 1 of 7. */
export function RegisterLanguageScreen({ navigation }: Props) {
  const draft = useRegistrationDraft();

  return (
    <ScreenContainer title="Choose Your Language" subtitle="Step 1 of 7 -- Piliin ang iyong wika">
      <Button
        label="English"
        variant={draft.language === "en" ? "primary" : "outline"}
        onPress={() => updateRegistrationDraft({ language: "en" })}
      />
      <Button
        label="Tagalog"
        variant={draft.language === "tl" ? "primary" : "outline"}
        onPress={() => updateRegistrationDraft({ language: "tl" })}
      />
      <Button label="Continue" disabled={!draft.language} onPress={() => navigation.navigate("RegisterBirthday")} />
    </ScreenContainer>
  );
}
