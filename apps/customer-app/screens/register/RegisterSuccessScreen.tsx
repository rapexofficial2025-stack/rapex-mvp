import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../types/navigation";
import { GradientScreenBackground } from "../../components/GradientScreenBackground";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterSuccess">;

/**
 * Shown once, immediately after the real Xano account-creation call
 * succeeds (RegisterAccountScreen), before the remaining KYC/contact/
 * location steps. Tap-anywhere-to-continue per spec, not an auto-timed
 * screen -- this is a deliberate confirmation beat, not a loading screen.
 */
export function RegisterSuccessScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const draft = useRegistrationDraft();

  return (
    <Pressable style={{ flex: 1 }} onPress={() => navigation.replace("RegisterIdentity")} accessibilityRole="button">
      <GradientScreenBackground />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: theme.spacing.md, padding: theme.spacing.xl }}>
        <Text style={{ fontSize: 40 }}>{"✓"}</Text>
        <Text
          style={{
            fontSize: theme.typography.fontSize["2xl"],
            fontWeight: "800",
            color: theme.colors.textPrimary,
            textAlign: "center",
          }}
        >
          You are now registered!
        </Text>
        {draft.firstName ? (
          <Text style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textSecondary, textAlign: "center" }}>
            Welcome to RAPEX, {draft.firstName}.
          </Text>
        ) : null}
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, marginTop: theme.spacing.lg }}>
          Tap anywhere to continue
        </Text>
      </View>
    </Pressable>
  );
}
