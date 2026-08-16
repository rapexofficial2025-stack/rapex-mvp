import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RapexGlassCard } from "@rapex/ui-native";
import type { RootStackParamList } from "../../types/navigation";
import { updateChildRegistrationDraft, useChildRegistrationDraft } from "../../services/childRegistrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "ChildBasicInfo">;

const GENDER_OPTIONS: Array<"Male" | "Female" | "Prefer not to say"> = ["Male", "Female", "Prefer not to say"];

/** Step 1 of 4 -- Add Child. Header back-arrow (native stack default) goes to ChildAccounts; Next goes to ChildAddress. Draft store means neither loses data. */
export function ChildBasicInfoScreen({ navigation }: Props) {
  const draft = useChildRegistrationDraft();

  const canContinue = draft.fullName.trim().length > 0 && draft.email.trim().length > 0 && draft.password.length > 0 && draft.dateOfBirth.length > 0;

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <RapexGlassCard style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.stepLabel}>Step 1 of 4</Text>
              <Text style={styles.title}>Add Child -- Basic Info</Text>

              <Field label="Full Name" value={draft.fullName} onChangeText={(v) => updateChildRegistrationDraft({ fullName: v })} placeholder="e.g. John Dela Cruz" />
              <Field label="Email" value={draft.email} onChangeText={(v) => updateChildRegistrationDraft({ email: v })} placeholder="child@example.com" keyboardType="email-address" autoCapitalize="none" />
              <Field label="Password" value={draft.password} onChangeText={(v) => updateChildRegistrationDraft({ password: v })} placeholder="********" secureTextEntry />
              <Field label="Birthday (YYYY-MM-DD)" value={draft.dateOfBirth} onChangeText={(v) => updateChildRegistrationDraft({ dateOfBirth: v })} placeholder="2012-04-10" keyboardType="number-pad" />

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.chipRow}>
                  {GENDER_OPTIONS.map((option) => (
                    <Pressable
                      key={option}
                      onPress={() => updateChildRegistrationDraft({ gender: option })}
                      style={[styles.chip, draft.gender === option && styles.chipActive]}
                    >
                      <Text style={styles.chipText}>{option}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                disabled={!canContinue}
                onPress={() => navigation.navigate("ChildAddress")}
                style={({ pressed }) => [styles.ctaWrap, { opacity: pressed || !canContinue ? 0.7 : 1 }]}
              >
                <LinearGradient colors={["#F97316", "#EC4899", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaButton}>
                  <Text style={styles.ctaText}>Next: Address</Text>
                  <ChevronRight color="#FFFFFF" size={18} />
                </LinearGradient>
              </Pressable>
            </View>
          </RapexGlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "sentences";
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        style={[styles.input, props.multiline && styles.inputMultiline]}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
        secureTextEntry={props.secureTextEntry}
        multiline={props.multiline}
      />
    </View>
  );
}

export const childFormStyles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#130C24" },
  scroll: { padding: 20, paddingTop: 24 },
  card: { width: "100%" },
  cardInner: { padding: 18, gap: 14 },
  stepLabel: { fontSize: 10, fontWeight: "800", color: "#C4B5FD", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 15, fontWeight: "800", color: "#FFFFFF" },
  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  inputMultiline: { minHeight: 80, textAlignVertical: "top" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  chipActive: { backgroundColor: "#8B5CF6", borderColor: "#F97316" },
  chipText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  ctaWrap: { marginTop: 4 },
  ctaButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 18 },
  ctaText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  backCtaButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  backCtaText: { color: "rgba(255,255,255,0.85)", fontWeight: "700", fontSize: 13 },
  buttonRow: { flexDirection: "row", gap: 10 },
  flex1: { flex: 1 },
});

const styles = childFormStyles;
