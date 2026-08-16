import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MapPin } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { AuthButton } from "../components/buttons/AuthButton";
import { GradientButton } from "../components/buttons/GradientButton";
import { InputField } from "../components/ui/InputField";
import { SelectField } from "../components/ui/SelectField";

type Props = NativeStackScreenProps<AuthStackParamList, "SignUpAddress">;

// Pilot launch area is Cavite towns only, per instruction ("just place only
// 4 data for municipality"). Zip codes are the real official PSGC postal
// codes for these towns EXCEPT Kawit, which was given explicitly as 4101 --
// that doesn't match the real PSGC code (4104), so using what was given;
// flag if that was meant to be something else.
const REGION_OPTIONS = [{ label: "Region IV-A (CALABARZON)", value: "region-4a" }];

const MUNICIPALITY_OPTIONS: { label: string; value: string; zip: string }[] = [
  { label: "Kawit", value: "kawit", zip: "4101" },
  { label: "General Trias", value: "gen-trias", zip: "4107" },
  { label: "Imus", value: "imus", zip: "4103" },
  { label: "Bacoor", value: "bacoor", zip: "4102" },
];

/**
 * Screen 4b -- Address step of the SignUp flow (Basic Info -> Address ->
 * Verification -> Complete -> REX mp4). Region/Municipality are the real
 * dropdown pattern; "Open Location" below is a static placeholder, NOT a
 * real interactive map -- apps/auth-preview is deliberately built with
 * zero native dependencies (no react-native-maps) so it never needs an EAS
 * dev-client build, see App.tsx's doc comment. A real map belongs in
 * apps/customer-app's own AddressScreen, not here.
 */
export function SignUpAddressScreen({ navigation }: Props) {
  const [region, setRegion] = useState<string | null>(REGION_OPTIONS[0].value);
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [barangay, setBarangay] = useState("");
  const [street, setStreet] = useState("");
  const [defaultDelivery, setDefaultDelivery] = useState(true);

  const selectedMunicipality = MUNICIPALITY_OPTIONS.find((m) => m.value === municipality);
  const canContinue = municipality !== null && barangay.trim().length > 0 && street.trim().length > 0;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Your Address</Text>
        <Text style={styles.subheading}>Used to set your delivery address.</Text>

        <SelectField label="Region" value={region} options={REGION_OPTIONS} onChange={setRegion} />
        <SelectField
          label="Municipality"
          value={municipality}
          options={MUNICIPALITY_OPTIONS}
          onChange={setMunicipality}
          placeholder="Select municipality"
        />
        {selectedMunicipality ? (
          <View style={styles.zipWrap}>
            <Text style={styles.zipLabel}>Zip Code</Text>
            <Text style={styles.zipValue}>{selectedMunicipality.zip}</Text>
          </View>
        ) : null}

        <InputField placeholder="Barangay" value={barangay} onChangeText={setBarangay} />
        <InputField placeholder="Street & House Number (Address 1)" value={street} onChangeText={setStreet} />

        <View style={styles.locationSection}>
          <View style={styles.locationHeader}>
            <MapPin color="#FB923C" size={14} />
            <Text style={styles.locationHeaderText}>Open Location</Text>
          </View>
          {/* Static placeholder -- see doc comment above for why there's no real map here. */}
          <View style={styles.mapPlaceholder}>
            <MapPin color="#8B5CF6" size={28} />
            <Text style={styles.mapPlaceholderText}>Map preview placeholder</Text>
          </View>

          <Pressable style={styles.toggleRow} onPress={() => setDefaultDelivery((v) => !v)}>
            <View style={[styles.checkbox, defaultDelivery && styles.checkboxActive]} />
            <Text style={styles.toggleText}>Set as default address for delivery</Text>
          </Pressable>
        </View>

        <GradientButton title="Continue" onPress={() => navigation.navigate("MobileOtp")} disabled={!canContinue} />
        <AuthButton title="Back" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#100B24" },
  container: { flexGrow: 1, justifyContent: "center", padding: 24 },
  heading: { fontSize: 32, fontWeight: "900", color: "#FFFFFF", marginBottom: 12 },
  subheading: { fontSize: 16, color: "rgba(255,255,255,0.74)", marginBottom: 28, lineHeight: 24 },
  zipWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, marginTop: -8 },
  zipLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" },
  zipValue: { fontSize: 13, fontWeight: "800", color: "#FDBA74" },
  locationSection: { marginTop: 8, marginBottom: 20, gap: 10 },
  locationHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  locationHeaderText: { fontSize: 12, fontWeight: "800", color: "#FB923C", textTransform: "uppercase", letterSpacing: 0.5 },
  mapPlaceholder: {
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  mapPlaceholderText: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  checkboxActive: { backgroundColor: "#F97316", borderColor: "#F97316" },
  toggleText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
});
