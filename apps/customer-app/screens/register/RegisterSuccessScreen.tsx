import { Pressable, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../types/navigation";
import { GradientScreenBackground } from "../../components/GradientScreenBackground";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "RegisterSuccess">;

/**
 * Shown once, immediately after RegisterAccountScreen's real Xano
 * account-creation call succeeds. Tap-anywhere-to-continue per spec, not an
 * auto-timed screen -- this is a deliberate confirmation beat, not a
 * loading screen. The account is `pending_verification` at this point
 * (needs Admin approval before login works) -- the REX welcome animation
 * next is purely a local onboarding beat, not a claim the account is fully
 * active yet.
 */
export function RegisterSuccessScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const draft = useRegistrationDraft();

  return (
    <Pressable style={{ flex: 1 }} onPress={() => navigation.replace("WelcomeVideo")} accessibilityRole="button">
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
