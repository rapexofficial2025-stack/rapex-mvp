import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ShieldCheck, ArrowRight, Calendar, Globe } from "lucide-react-native";
import type { AuthStackParamList } from "../App";
import { SelectField } from "../components/ui/SelectField";
import { LightGlassBackground } from "../components/ui/LightGlassBackground";
import { setSignUpCulture } from "../services/signUpDraftStore";

type Props = NativeStackScreenProps<AuthStackParamList, "AgeGate">;

const CURRENT_YEAR = new Date().getFullYear();

// The 8 examples given directly -- real source is Xano's GET
// /rapex-core/community-master (community_master: id, name, description,
// is_active), which has the complete 14-item list. Swap this hardcoded
// array for that fetch once auth-preview (or its successor) is wired to
// real endpoints.
const CULTURE_OPTIONS = [
  { label: "Tagalog", value: "tagalog" },
  { label: "Cebuano / Bisaya", value: "bisaya" },
  { label: "Ilocano", value: "ilocano" },
  { label: "Chavacano", value: "chavacano" },
  { label: "Waray", value: "waray" },
  { label: "Samal", value: "samal" },
  { label: "Bicolano", value: "bicolano" },
  { label: "Other", value: "other" },
];

/**
 * Screen 2 -- visual only, no real backend age check here (that lives in
 * apps/customer-app's AgeGateScreen, which calls the real Xano
 * /pre-auth/check-age endpoint). Under 18 still routes to the SAME Login
 * screen as everyone else -- there is no separate Child screen anywhere in
 * auth. A minor never self-registers here; their parent already created
 * their login credentials via Profile > Child Accounts (see
 * apps/customer-app/screens/child-accounts/), so under-18 just means
 * "log in with the account your parent made for you," not a different UI
 * or an exit/dead-end.
 *
 * Card depth layers (top light edge, corner glow, diagonal shine) ported
 * from a Base44-generated reference into RN-native techniques -- same
 * approach as components/cards/GlassCard.tsx.
 */
export function AgeGateScreen({ navigation }: Props) {
  const [birthYear, setBirthYear] = useState(String(CURRENT_YEAR - 25));
  const [culture, setCulture] = useState<string | null>(null);
  const yearNumber = Number(birthYear);
  const displayAge = Number.isFinite(yearNumber) && birthYear.length === 4 ? CURRENT_YEAR - yearNumber : null;
  const underage = displayAge !== null && displayAge < 18;

  return (
    <View style={styles.flex}>
      <StatusBar style="dark" />
      <View style={styles.flex}>
        <LightGlassBackground />
        <SafeAreaView style={[styles.flex, styles.center]}>
          <View style={styles.card}>
            <LinearGradient
              colors={["rgba(139, 92, 246, 0.7)", "rgba(249, 115, 22, 0.5)", "rgba(255, 255, 255, 0.15)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBorder}
            >
              <View style={styles.cardClip}>
                <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />

                {/* Top-left light edge + bottom-right purple glow, matching GlassCard's depth recipe. */}
                <LinearGradient
                  colors={["rgba(255,255,255,0.65)", "rgba(255,255,255,0)"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.edgeHighlight}
                  pointerEvents="none"
                />
                <View style={styles.glowPurple} pointerEvents="none">
                  <LinearGradient colors={["rgba(168,85,247,0.35)", "rgba(168,85,247,0)"]} style={StyleSheet.absoluteFill} />
                </View>

                <View style={styles.cardInner}>
                  {/* Diamond-rotated badge -- icon counter-rotated to stay upright. */}
                  <View style={styles.diamondWrap}>
                    <ShieldCheck color="#FFFFFF" size={26} style={styles.diamondIcon} />
                  </View>

                  <Text style={styles.pill}>Philippine 18+ Security Policy</Text>
                  <Text style={styles.title}>Age Verification</Text>
                  <Text style={styles.subtitle}>
                    Enter your Year of Birth to proceed. RAPEX strictly requires users to be 18 years or older.
                  </Text>

                  <View style={styles.field}>
                    <Text style={styles.inputLabel}>Enter your Year of Birth</Text>
                    <View style={styles.inputWrap}>
                      <Calendar color="rgba(46,16,101,0.5)" size={18} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        maxLength={4}
                        placeholder="YYYY"
                        placeholderTextColor="rgba(46,16,101,0.3)"
                        value={birthYear}
                        onChangeText={setBirthYear}
                      />
                      {displayAge !== null ? (
                        <View style={styles.ageChip}>
                          <Text style={styles.ageChipText}>Age: {displayAge}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  <View style={styles.cultureWrap}>
                    <SelectField
                      label="What is your Culture?"
                      value={culture}
                      options={CULTURE_OPTIONS}
                      onChange={(v) => {
                        setCulture(v);
                        setSignUpCulture(v);
                      }}
                      placeholder="Select your culture… (optional)"
                      icon={Globe}
                      tone="light"
                    />
                  </View>

                  {underage ? (
                    <View style={styles.noticeBox}>
                      <Text style={styles.noticeText}>
                        You're under 18 -- log in with the account your parent already created for you.
                      </Text>
                    </View>
                  ) : null}

                  <Pressable
                    disabled={birthYear.length !== 4}
                    onPress={() => navigation.navigate("Login")}
                    style={({ pressed }) => [styles.ctaWrap, { opacity: pressed ? 0.9 : 1 }]}
                  >
                    <LinearGradient
                      colors={["#8B5CF6", "#6366F1", "#F97316"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.ctaButton}
                    >
                      <Text style={styles.ctaText}>{underage ? "Log In" : "Confirm Age & Continue"}</Text>
                      <ArrowRight color="#FFFFFF" size={16} />
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  card: {
    width: "100%",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cardBorder: { borderRadius: 24, padding: 1 },
  cardClip: { borderRadius: 23, overflow: "hidden" },
  edgeHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "65%",
    height: "55%",
  },
  glowPurple: {
    position: "absolute",
    bottom: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  cardInner: { padding: 24, alignItems: "center", gap: 14, backgroundColor: "rgba(255, 255, 255, 0.4)" },
  diamondWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    transform: [{ rotate: "45deg" }],
    shadowColor: "#6D28D9",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  diamondIcon: { transform: [{ rotate: "-45deg" }] },
  pill: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#C2410C",
    backgroundColor: "rgba(249,115,22,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    textTransform: "uppercase",
    overflow: "hidden",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#2E1065" },
  subtitle: { fontSize: 12, color: "rgba(46, 16, 101, 0.7)", textAlign: "center", lineHeight: 18 },
  field: { width: "100%", gap: 6 },
  inputLabel: { fontSize: 12, fontWeight: "700", color: "rgba(46,16,101,0.8)" },
  inputWrap: { position: "relative", justifyContent: "center" },
  inputIcon: { position: "absolute", left: 14, zIndex: 1 },
  input: {
    textAlign: "center",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#2E1065",
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.55)",
    borderRadius: 16,
    paddingVertical: 14,
    paddingLeft: 42,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  ageChip: {
    position: "absolute",
    right: 12,
    backgroundColor: "rgba(220,252,231,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ageChipText: { fontSize: 11, fontWeight: "800", color: "#15803D" },
  cultureWrap: { width: "100%" },
  noticeBox: {
    width: "100%",
    backgroundColor: "rgba(254,215,170,0.6)",
    borderWidth: 1,
    borderColor: "rgba(234,88,12,0.28)",
    borderRadius: 14,
    padding: 12,
  },
  noticeText: { color: "#9A3412", fontSize: 12, textAlign: "center", fontWeight: "600", lineHeight: 17 },
  ctaWrap: { width: "100%", marginTop: 4 },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 18,
  },
  ctaText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
});
