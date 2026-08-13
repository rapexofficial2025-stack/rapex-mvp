import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button } from "@rapex/ui-native";
import type { RootStackParamList } from "../../types/navigation";
import { ScreenContainer } from "../../components/ScreenContainer";
import { useAppTheme } from "../../hooks/useAppTheme";
import { updateRegistrationDraft } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "PrivacyTerms">;

const TERMS_TEXT =
  "By creating an account, accessing, or using the RAPEX platform, you acknowledge that you have read, understood, and agreed to comply with these Terms and Conditions.\n\n" +
  "1. ACCOUNT INFORMATION -- You agree to provide accurate, complete, and up-to-date information when creating and maintaining your RAPEX account.\n\n" +
  "2. ACCOUNT ROLE AND VERIFICATION -- Certain roles (Merchant, Rider, Admin) may require additional identity, business, or eligibility verification.\n\n" +
  "3. ACCEPTABLE USE -- You agree to use RAPEX only for lawful and legitimate purposes.\n\n" +
  "4. ORDERS AND TRANSACTIONS -- Products and services available through RAPEX may be provided by independent merchants and service providers.\n\n" +
  "5. ACCOUNT SUSPENSION -- RAPEX reserves the right to restrict, suspend, or terminate access to an account that violates these Terms.\n\n" +
  "The full Terms of Service will be published by RAPEX before official launch.";

const PRIVACY_TEXT =
  "RAPEX collects the account and registration information you provide (name, email, phone, and the verification details you submit) to create and secure your account, process orders, and provide support.\n\n" +
  "Your personal information will be handled in accordance with the RAPEX Privacy Policy and the Philippine Data Privacy Act once published.\n\n" +
  "By continuing, you acknowledge that you're creating a real RAPEX account and agree to be bound by those terms once published.";

/**
 * Gate before the registration form. The full legal Privacy Policy / Terms
 * of Service text isn't in this repo yet -- RAPEX legal owns that copy, not
 * this codebase -- so this shows an honest placeholder summary instead of
 * fabricated legal language, arranged in the founder-provided reference
 * design's Terms/Privacy tab layout.
 */
export function PrivacyTermsScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const [accepted, setAccepted] = useState(false);
  const [activeTab, setActiveTab] = useState<"TERMS" | "PRIVACY">("TERMS");

  return (
    <ScreenContainer title="Privacy Policy & Terms" subtitle="Please review before creating your account">
      <View style={{ flexDirection: "row", gap: theme.spacing.xs, backgroundColor: theme.colors.surfaceAlt, padding: 4, borderRadius: theme.radius.lg }}>
        {(["TERMS", "PRIVACY"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: theme.spacing.sm,
              borderRadius: theme.radius.md,
              alignItems: "center",
              backgroundColor: activeTab === tab ? theme.colors.brandPrimary : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: theme.typography.fontSize.sm,
                fontWeight: "800",
                color: activeTab === tab ? theme.colors.textInverse : theme.colors.textSecondary,
              }}
            >
              {tab === "TERMS" ? "Terms & Condition" : "Privacy Policy"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={{ maxHeight: 320, borderRadius: theme.radius.md, backgroundColor: theme.colors.surfaceAlt }}
        contentContainerStyle={{ padding: theme.spacing.md, gap: theme.spacing.sm }}
      >
        <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary, lineHeight: 20 }}>
          {activeTab === "TERMS" ? TERMS_TEXT : PRIVACY_TEXT}
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
          I have read and agree to the Terms & Condition and Privacy Policy.
        </Text>
      </Pressable>

      <Button
        label="Continue"
        disabled={!accepted}
        onPress={() => {
          updateRegistrationDraft({ privacyAccepted: true });
          navigation.navigate("Register");
        }}
      />
      <Button label="Back" variant="secondary" onPress={() => navigation.goBack()} />
    </ScreenContainer>
  );
}
