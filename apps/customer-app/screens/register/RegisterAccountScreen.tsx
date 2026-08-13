import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChevronRight, Eye, EyeOff, MapPin } from "lucide-react-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import { RapexGlassCard, ErrorState } from "@rapex/ui-native";
import { PILOT_AREAS, type PilotArea } from "@rapex/constants";
import type { RootStackParamList } from "../../types/navigation";
import { PickerField } from "../../components/PickerField";
import { LANGUAGE_OPTIONS, updateRegistrationDraft, useRegistrationDraft, type RapexLanguage } from "../../services/registrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

/**
 * Single combined registration form (replaces the old separate Language +
 * Birthday + Account steps) -- matches the founder-provided reference
 * design's "Account Information Fill-Up" screen exactly: language cards,
 * name/email/mobile/password, then Cavite delivery address fields, one
 * submit. Age is already gated at AgeGateScreen (real backend check) before
 * this screen is ever reached, so it isn't asked again here.
 *
 * GAP (flagged, not guessed around): there's no real region/province/
 * municipality/barangay ID lookup in this codebase (only the fixed
 * PILOT_AREAS constant + free-text barangay/street), so `address_line_1` is
 * sent but the *_id fields are omitted -- see AuthRepository's RegisterInput
 * doc comment. Only birth *year* is collected (at AgeGateScreen), so
 * `date_of_birth` is a January 1 placeholder for that year, not a full DOB.
 */
export function RegisterAccountScreen({ navigation }: Props) {
  const { auth } = useRepositories();
  const draft = useRegistrationDraft();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [municipality, setMunicipality] = useState<PilotArea>(PILOT_AREAS[0]);
  const [barangay, setBarangay] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");

  const register = useAsyncAction(() => {
    const [firstName, ...rest] = fullName.trim().split(" ");
    const surname = rest.join(" ");
    // Kept in the shared draft so downstream screens (RegisterSuccess's
    // greeting, WelcomeVideo's "Hi, {name}!", Profile) can read it -- this
    // form uses local state for editing, the draft store for sharing.
    updateRegistrationDraft({ firstName: firstName || fullName, surname, email, mobile, password });
    return auth.register({
      email,
      password,
      role: "customer",
      firstName: firstName || fullName,
      lastName: surname,
      mobile,
      dateOfBirth: draft.dateOfBirth ?? undefined,
      addressLine1: `${street}, ${barangay}, ${municipality}${landmark ? ` (near ${landmark})` : ""}`,
    });
  });

  const canSubmit =
    fullName.trim().length > 0 && email.trim().length > 0 && mobile.trim().length > 0 && password.length > 0 && draft.language !== null;

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <RapexGlassCard style={styles.card}>
            <View style={styles.cardInner}>
              <View style={styles.headerRow}>
                <Text style={styles.title}>Account Information Fill-Up</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>App Language Preference</Text>
                <View style={styles.languageGrid}>
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <Pressable
                      key={lang.id}
                      onPress={() => updateRegistrationDraft({ language: lang.id as RapexLanguage })}
                      style={[styles.languageCard, draft.language === lang.id && styles.languageCardActive]}
                    >
                      <Text style={styles.languageText}>
                        {lang.flag} {lang.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Field label="Full Name" value={fullName} onChangeText={setFullName} placeholder="e.g. Irvin Jay" />
                <View style={styles.row}>
                  <View style={styles.flex1}>
                    <Field label="Email Address" value={email} onChangeText={setEmail} placeholder="you@rapex.ph" keyboardType="email-address" autoCapitalize="none" />
                  </View>
                  <View style={styles.flex1}>
                    <Field label="Mobile Number" value={mobile} onChangeText={setMobile} placeholder="09171234567" keyboardType="phone-pad" />
                  </View>
                </View>
                <View>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.passwordWrap}>
                    <TextInput
                      style={styles.passwordInput}
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                    <Pressable onPress={() => setShowPassword((v) => !v)}>
                      {showPassword ? <EyeOff color="#C4B5FD" size={16} /> : <Eye color="#C4B5FD" size={16} />}
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>
                  <MapPin color="#FB923C" size={13} /> Cavite Delivery Location
                </Text>
                <PickerField label="Municipality / City" value={municipality} options={[...PILOT_AREAS]} onSelect={(v) => setMunicipality(v as PilotArea)} />
                <Field label="Barangay" value={barangay} onChangeText={setBarangay} placeholder="e.g. Alapan II" />
                <Field label="Street & House Number" value={street} onChangeText={setStreet} placeholder="e.g. 1618 Advincula Ave" />
                <Field label="Nearest Rider Landmark" value={landmark} onChangeText={setLandmark} placeholder="e.g. Beside Chapel / Brgy Hall" />
              </View>

              {register.error ? <ErrorState description={register.error} /> : null}

              <Pressable
                disabled={!canSubmit || register.loading}
                onPress={async () => {
                  await register.execute();
                  navigation.navigate("RegisterSuccess");
                }}
                style={({ pressed }) => [styles.ctaWrap, { opacity: pressed || !canSubmit ? 0.7 : 1 }]}
              >
                <LinearGradient
                  colors={["#F97316", "#EC4899", "#8B5CF6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaButton}
                >
                  <Text style={styles.ctaText}>{register.loading ? "Submitting…" : "Submit Account & Address Details"}</Text>
                  <ChevronRight color="#FFFFFF" size={18} />
                </LinearGradient>
              </Pressable>

              <Pressable onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Already have an account? Log In</Text>
              </Pressable>
            </View>
          </RapexGlassCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences";
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        keyboardType={props.keyboardType}
        autoCapitalize={props.autoCapitalize}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#130C24" },
  flex1: { flex: 1 },
  scroll: { padding: 20, paddingTop: 40 },
  card: { width: "100%" },
  cardInner: { padding: 18, gap: 14 },
  headerRow: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.15)", paddingBottom: 8 },
  title: { fontSize: 15, fontWeight: "800", color: "#FFFFFF", textTransform: "uppercase" },
  section: { gap: 8 },
  sectionLabel: { fontSize: 10, fontWeight: "800", color: "#C4B5FD", textTransform: "uppercase", letterSpacing: 1 },
  languageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  languageCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  languageCardActive: { backgroundColor: "#8B5CF6", borderColor: "#F97316" },
  languageText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  row: { flexDirection: "row", gap: 10 },
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
  passwordWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  passwordInput: { flex: 1, color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  ctaWrap: { marginTop: 4 },
  ctaButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 18 },
  ctaText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  loginLink: { textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 4 },
});
