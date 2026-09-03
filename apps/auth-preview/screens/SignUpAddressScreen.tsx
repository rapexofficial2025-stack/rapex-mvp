import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MapPin, Mail, ShieldCheck } from "lucide-react-native";
import * as Location from "expo-location";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { AuthButton } from "../components/buttons/AuthButton";
import { GradientButton } from "../components/buttons/GradientButton";
import { InputField } from "../components/ui/InputField";
import { SelectField } from "../components/ui/SelectField";
import { ImageCaptureField } from "../components/ui/ImageCaptureField";

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

const ID_TYPE_OPTIONS = [
  { label: "National ID", value: "national-id" },
  { label: "Driver's License", value: "drivers-license" },
  { label: "Passport", value: "passport" },
  { label: "UMID", value: "umid" },
  { label: "PhilHealth ID", value: "philhealth" },
  { label: "Voter's ID", value: "voters-id" },
];

/**
 * Screen 4b -- Address + GPS + Verification + Identity, consolidated onto
 * ONE scrollable screen per instruction ("the screens are not 10, just
 * place them on the same screen by scrolling") -- this replaces what used
 * to be separate SignUpAddress -> MobileOtp -> EmailVerification screens.
 * "Open Location" is a REAL GPS request (expo-location), not the earlier
 * static map placeholder -- still no interactive map view though, that
 * would need react-native-maps and break auth-preview's zero-native-deps/
 * Expo-Go-only promise (see App.tsx's doc comment). ID/Selfie capture is
 * camera-only (no gallery picker), matching "no ordinary uploaded selfie."
 * Purely visual -- nothing here calls a backend.
 */
export function SignUpAddressScreen({ navigation }: Props) {
  // Address
  const [region, setRegion] = useState<string | null>(REGION_OPTIONS[0].value);
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [barangay, setBarangay] = useState("");
  const [street, setStreet] = useState("");

  // GPS
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [defaultDelivery, setDefaultDelivery] = useState(true);

  // Verification
  const [mobileNumber, setMobileNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  // Identity
  const [idType, setIdType] = useState<string | null>(null);
  const [idFrontCaptured, setIdFrontCaptured] = useState(false);
  const [idBackCaptured, setIdBackCaptured] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);

  const selectedMunicipality = MUNICIPALITY_OPTIONS.find((m) => m.value === municipality);

  async function captureLocation() {
    setGpsLoading(true);
    setGpsError(null);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setGpsError("Location access is required to confirm your operating area.");
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setGpsCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
    } catch {
      setGpsError("Couldn't get your location. Check that location services are enabled.");
    } finally {
      setGpsLoading(false);
    }
  }

  const canContinue =
    municipality !== null &&
    barangay.trim().length > 0 &&
    street.trim().length > 0 &&
    otpCode.length === 6 &&
    emailVerified &&
    idType !== null &&
    idFrontCaptured &&
    idBackCaptured &&
    selfieCaptured;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.page}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Address &amp; Verification</Text>

        {/* -- Address -- */}
        <Text style={styles.sectionLabel}>Address</Text>
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

        {/* -- GPS -- */}
        <Text style={styles.sectionLabel}>Location</Text>
        <Text style={styles.sectionHint}>
          Confirms your operating area and improves local marketplace/delivery matching.
        </Text>
        {gpsCoords ? (
          <View style={styles.gpsCapturedRow}>
            <MapPin color="#22C55E" size={16} />
            <Text style={styles.gpsCapturedText}>
              Location captured ({gpsCoords.lat.toFixed(4)}, {gpsCoords.lng.toFixed(4)})
            </Text>
          </View>
        ) : (
          <AuthButton title={gpsLoading ? "Getting location…" : "Use My Location"} onPress={captureLocation} />
        )}
        {gpsError ? <Text style={styles.errorText}>{gpsError}</Text> : null}

        <Pressable style={styles.toggleRow} onPress={() => setDefaultDelivery((v) => !v)}>
          <View style={[styles.checkbox, defaultDelivery && styles.checkboxActive]} />
          <Text style={styles.toggleText}>Set as default address for delivery</Text>
        </Pressable>

        {/* -- Verification -- */}
        <Text style={styles.sectionLabel}>Verification</Text>
        <InputField
          placeholder="Mobile Number"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          keyboardType="phone-pad"
        />
        {!otpSent ? (
          <AuthButton
            title="Send OTP"
            onPress={() => setOtpSent(true)}
          />
        ) : (
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>Enter 6-digit code</Text>
            <TextInput
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              style={styles.otpInput}
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>
        )}

        <Pressable style={styles.emailRow} onPress={() => setEmailVerified(true)} disabled={emailVerified}>
          <Mail color={emailVerified ? "#22C55E" : "#FB923C"} size={16} />
          <Text style={styles.emailRowText}>{emailVerified ? "Email verified" : "Verify Email Account"}</Text>
          {emailVerified ? <ShieldCheck color="#22C55E" size={16} /> : null}
        </Pressable>

        {/* -- Identity -- */}
        <Text style={styles.sectionLabel}>Identity Verification</Text>
        <SelectField label="ID Type" value={idType} options={ID_TYPE_OPTIONS} onChange={setIdType} placeholder="Select ID Type" />
        <ImageCaptureField label="ID Front" onCaptured={() => setIdFrontCaptured(true)} />
        <ImageCaptureField label="ID Back" onCaptured={() => setIdBackCaptured(true)} />
        <ImageCaptureField label="Selfie" onCaptured={() => setSelfieCaptured(true)} />
        <Text style={styles.note}>
          Collection only for now -- current backend does manual/admin review, not automated ID-genuineness or
          liveness checks.
        </Text>

        <GradientButton title="Continue" onPress={() => navigation.navigate("SignUpProfileWallet")} disabled={!canContinue} />
        <AuthButton title="Back" onPress={() => navigation.goBack()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#100B24" },
  container: { padding: 24, paddingTop: 40 },
  heading: { fontSize: 28, fontWeight: "900", color: "#FFFFFF", marginBottom: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#C4B5FD",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHint: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 10, lineHeight: 17 },
  zipWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14, marginTop: -8 },
  zipLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" },
  zipValue: { fontSize: 13, fontWeight: "800", color: "#FDBA74" },
  gpsCapturedRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  gpsCapturedText: { color: "rgba(255,255,255,0.8)", fontSize: 12 },
  errorText: { color: "#FCA5A5", fontSize: 12, marginBottom: 10 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 12, marginBottom: 4 },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: "rgba(255,255,255,0.4)" },
  checkboxActive: { backgroundColor: "#F97316", borderColor: "#F97316" },
  toggleText: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  fieldWrap: { gap: 6, marginBottom: 14 },
  fieldLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" },
  otpInput: {
    height: 54,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 20,
    letterSpacing: 10,
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  emailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  emailRowText: { flex: 1, color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  note: { fontSize: 11, color: "rgba(255,255,255,0.5)", fontStyle: "italic", marginTop: 4, marginBottom: 16, lineHeight: 16 },
});
