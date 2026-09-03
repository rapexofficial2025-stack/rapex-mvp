import { Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RapexGlassCard } from "@rapex/ui-native";
import type { RootStackParamList } from "../../types/navigation";
import { updateChildRegistrationDraft, useChildRegistrationDraft } from "../../services/childRegistrationStore";
import { Field, childFormStyles as styles } from "./ChildBasicInfoScreen";

type Props = NativeStackScreenProps<RootStackParamList, "ChildStudentStatus">;

/** Step 3 of 4 -- Add Child. Header back-arrow + explicit Back both go to ChildAddress; Next goes to ChildAuthorization. */
export function ChildStudentStatusScreen({ navigation }: Props) {
  const draft = useChildRegistrationDraft();

  const canContinue =
    draft.isStudent === true
      ? draft.studentVerificationRef.trim().length > 0
      : draft.isStudent === false
        ? draft.nonStudentReason.trim().length > 0 && draft.intendedUsePurpose.trim().length > 0
        : false;

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <RapexGlassCard style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.stepLabel}>Step 3 of 4</Text>
              <Text style={styles.title}>Add Child -- Student Status</Text>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Is your child a student?</Text>
                <View style={styles.chipRow}>
                  <Pressable
                    onPress={() => updateChildRegistrationDraft({ isStudent: true })}
                    style={[styles.chip, draft.isStudent === true && styles.chipActive]}
                  >
                    <Text style={styles.chipText}>Yes</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => updateChildRegistrationDraft({ isStudent: false })}
                    style={[styles.chip, draft.isStudent === false && styles.chipActive]}
                  >
                    <Text style={styles.chipText}>No</Text>
                  </Pressable>
                </View>
              </View>

              {draft.isStudent === true ? (
                <Field
                  label="Student ID / School Name"
                  value={draft.studentVerificationRef}
                  onChangeText={(v) => updateChildRegistrationDraft({ studentVerificationRef: v })}
                  placeholder="e.g. 2024-00123, Rizal High School"
                />
              ) : null}

              {draft.isStudent === false ? (
                <>
                  <Field
                    label="Reason for wanting to use RAPEX"
                    value={draft.nonStudentReason}
                    onChangeText={(v) => updateChildRegistrationDraft({ nonStudentReason: v })}
                    placeholder="Tell us why"
                    multiline
                  />
                  <Field
                    label="Intended purpose of RAPEX use"
                    value={draft.intendedUsePurpose}
                    onChangeText={(v) => updateChildRegistrationDraft({ intendedUsePurpose: v })}
                    placeholder="e.g. ordering snacks, small errands"
                    multiline
                  />
                </>
              ) : null}

              <View style={styles.buttonRow}>
                <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.flex1, { opacity: pressed ? 0.7 : 1 }]}>
                  <View style={styles.backCtaButton}>
                    <ChevronLeft color="rgba(255,255,255,0.85)" size={18} />
                    <Text style={styles.backCtaText}>Back</Text>
                  </View>
                </Pressable>
                <Pressable
                  disabled={!canContinue}
                  onPress={() => navigation.navigate("ChildAuthorization")}
                  style={({ pressed }) => [styles.flex1, { opacity: pressed || !canContinue ? 0.7 : 1 }]}
                >
                  <LinearGradient colors={["#F97316", "#EC4899", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaButton}>
                    <Text style={styles.ctaText}>Next</Text>
                    <ChevronRight color="#FFFFFF" size={18} />
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
