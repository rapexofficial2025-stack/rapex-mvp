import { Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RapexGlassCard } from "@rapex/ui-native";
import type { RootStackParamList } from "../../types/navigation";
import { CascadingAddressPicker, EMPTY_CASCADING_ADDRESS, type CascadingAddressValue } from "../../components/CascadingAddressPicker";
import { updateChildRegistrationDraft, useChildRegistrationDraft } from "../../services/childRegistrationStore";
import { Field, childFormStyles as styles } from "./ChildBasicInfoScreen";

type Props = NativeStackScreenProps<RootStackParamList, "ChildAddress">;

/** Step 2 of 4 -- Add Child. Header back-arrow + explicit Back both go to ChildBasicInfo; Next goes to ChildStudentStatus. */
export function ChildAddressScreen({ navigation }: Props) {
  const draft = useChildRegistrationDraft();

  const address: CascadingAddressValue = {
    ...EMPTY_CASCADING_ADDRESS,
    municipalityId: draft.municipalityId,
    municipalityName: draft.municipalityName,
    barangayId: draft.barangayId,
    barangayName: draft.barangayName,
  };

  function onAddressChange(next: CascadingAddressValue) {
    updateChildRegistrationDraft({
      municipalityId: next.municipalityId,
      municipalityName: next.municipalityName,
      barangayId: next.barangayId,
      barangayName: next.barangayName,
    });
  }

  const canContinue = draft.barangayId !== null && draft.street.trim().length > 0;

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <RapexGlassCard style={styles.card}>
            <View style={styles.cardInner}>
              <Text style={styles.stepLabel}>Step 2 of 4</Text>
              <Text style={styles.title}>
                <MapPin color="#FB923C" size={13} /> Add Child -- Address
              </Text>

              <CascadingAddressPicker value={address} onChange={onAddressChange} />
              <Field label="Street & House Number" value={draft.street} onChangeText={(v) => updateChildRegistrationDraft({ street: v })} placeholder="e.g. 1618 Advincula Ave" />

              <View style={styles.buttonRow}>
                <Pressable onPress={() => navigation.goBack()} style={({ pressed }) => [styles.flex1, { opacity: pressed ? 0.7 : 1 }]}>
                  <View style={styles.backCtaButton}>
                    <ChevronLeft color="rgba(255,255,255,0.85)" size={18} />
                    <Text style={styles.backCtaText}>Back</Text>
                  </View>
                </Pressable>
                <Pressable
                  disabled={!canContinue}
                  onPress={() => navigation.navigate("ChildStudentStatus")}
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
