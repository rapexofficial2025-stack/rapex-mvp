import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@rapex/ui-native";
import type { RootStackParamList } from "../../types/navigation";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAppTheme } from "../../hooks/useAppTheme";
import { updateRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "PrivacyTerms">;

/**
 * Gate before the registration wizard starts (Language -> ... -> Account).
 * The full legal Privacy Policy / Terms of Service text isn't in this repo
 * yet -- RAPEX legal owns that copy, not this codebase -- so this shows an
 * honest placeholder summary instead of fabricated legal language. Swap
 * PLACEHOLDER_NOTICE for the real document once it's provided.
 */
export function PrivacyTermsScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const [accepted, setAccepted] = useState(false);

  return (
    <ScreenContainer title="Privacy Policy & Terms" subtitle="Please review before creating your account">
      <ScrollView
        style={{ maxHeight: 280, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt }}
        contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm }}
      >
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, lineHeight: 20 }}>
          RAPEX collects the account and registration information you provide (name, email, phone, and the
          verification details you submit) to create and secure your account, process orders, and provide support.
          {"\n\n"}
          The full Privacy Policy and Terms of Service will be published by RAPEX before official launch. By
          continuing, you acknowledge that you're creating a real RAPEX account and agree to be bound by those terms
          once published.
        </Text>
      </ScrollView>

      <Pressable
        onPress={() => setAccepted((v) => !v)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm, paddingVertical: theme.spacing.sm }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: theme.colors.brandPrimary,
            backgroundColor: accepted ? theme.colors.brandPrimary : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {accepted ? <Text style={{ color: theme.colors.textInverse, fontSize: 14, fontWeight: "700" }}>{"✓"}</Text> : null}
        </View>
        <Text style={{ flex: 1, fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>
          I have read and agree to the Privacy Policy and Terms of Service.
        </Text>
      </Pressable>

      <Button
        label="Continue"
        disabled={!accepted}
        onPress={() => {
          updateRegistrationDraft({ privacyAccepted: true });
          navigation.navigate("RegisterLanguage");
        }}
      />
      <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
}
