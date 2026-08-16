import { Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CheckSquare, ChevronLeft, Square } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RapexGlassCard, ErrorState } from "@rapex/ui-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../../types/navigation";
import { resetChildRegistrationDraft, updateChildRegistrationDraft, useChildRegistrationDraft } from "../../services/childRegistrationStore";
import { childFormStyles as styles } from "./ChildBasicInfoScreen";

type Props = NativeStackScreenProps<RootStackParamList, "ChildAuthorization">;

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{label}</Text>
      <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700", flexShrink: 1, textAlign: "right" }}>{value || "--"}</Text>
    </View>
  );
}

/**
 * Step 4 of 4 -- Add Child. The "parent confirms authorization" checkbox
 * here IS the authorization step per the Child Accounts spec -- there is no
 * separate approval workflow after this. Submitting calls
 * childAccount.createChildAccount (Mock until a real Xano endpoint exists),
 * which itself enforces the same required-field rules as a defense-in-depth
 * check, not just this screen's `canSubmit`.
 */
export function ChildAuthorizationScreen({ navigation }: Props) {
  const draft = useChildRegistrationDraft();
  const { childAccount } = useRepositories();
  const submit = useAsyncAction(async () => {
    if (!childAccount) throw new Error("Child account creation isn't available in this app build yet.");
    return childAccount.createChildAccount({
      fullName: draft.fullName,
      email: draft.email,
      password: draft.password,
      dateOfBirth: draft.dateOfBirth,
      gender: draft.gender,
      municipalityId: draft.municipalityId,
      municipalityName: draft.municipalityName,
      barangayId: draft.barangayId,
      barangayName: draft.barangayName,
      addressLine1: `${draft.street}, ${draft.barangayName ?? ""}, ${draft.municipalityName ?? ""}`,
      isStudent: draft.isStudent === true,
      studentVerificationRef: draft.studentVerificationRef || null,
      nonStudentReason: draft.nonStudentReason || null,
      intendedUsePurpose: draft.intendedUsePurpose || null,
      parentAuthorizationConfirmed: draft.parentAuthorizationConfirmed,
    });
  });

  const canSubmit = draft.parentAuthorizationConfirmed && !submit.loading;

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <RapexGlassCard style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.stepLabel}>Step 4 of 4</Text>
              <Text style={styles.title}>Add Child -- Confirm & Authorize</Text>

              <View style={{ gap: 8 }}>
                <SummaryRow label="Name" value={draft.fullName} />
                <SummaryRow label="Email" value={draft.email} />
                <SummaryRow label="Birthday" value={draft.dateOfBirth} />
                <SummaryRow label="Gender" value={draft.gender ?? ""} />
                <SummaryRow label="Address" value={`${draft.street}, ${draft.barangayName ?? ""}`} />
                <SummaryRow label="Student" value={draft.isStudent === true ? "Yes" : draft.isStudent === false ? "No" : ""} />
              </View>

              <Pressable
                onPress={() => updateChildRegistrationDraft({ parentAuthorizationConfirmed: !draft.parentAuthorizationConfirmed })}
                style={({ pressed }) => ({ flexDirection: "row", alignItems: "flex-start", gap: 10, opacity: pressed ? 0.8 : 1 })}
              >
                {draft.parentAuthorizationConfirmed ? (
                  <CheckSquare color="#F97316" size={20} />
                ) : (
                  <Square color="rgba(255,255,255,0.6)" size={20} />
                )}
                <Text style={{ flex: 1, color: "rgba(255,255,255,0.85)", fontSize: 12, lineHeight: 18 }}>
                  I am this child's parent/legal guardian, and I authorize creating this RAPEX Child Account for them.
                </Text>
              </Pressable>

              {submit.error ? <ErrorState description={submit.error} /> : null}

              <View style={styles.buttonRow}>
                <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.flex1, { opacity: pressed ? 0.7 : 1 }]}>
                  <View style={styles.backCtaButton}>
                    <ChevronLeft color="rgba(255,255,255,0.85)" size={18} />
                    <Text style={styles.backCtaText}>Back</Text>
                  </View>
                </Pressable>
                <Pressable
                  disabled={!canSubmit}
                  onPress={async () => {
                    await submit.execute();
                    resetChildRegistrationDraft();
                    navigation.navigate("ChildAccounts");
                  }}
                  style={({ pressed }) => [styles.flex1, { opacity: pressed || !canSubmit ? 0.7 : 1 }]}
                >
                  <LinearGradient colors={["#F97316", "#EC4899", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaButton}>
                    <Text style={styles.ctaText}>{submit.loading ? "Creating…" : "Create Child Account"}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </RapexGlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
