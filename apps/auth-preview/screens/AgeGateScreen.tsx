import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ShieldCheck, ArrowRight } from "lucide-react-native";
import type { AuthStackParamList } from "../App";
import { SelectField } from "../components/ui/SelectField";

type Props = NativeStackScreenProps<AuthStackParamList, "AgeGate">;

const CURRENT_YEAR = new Date().getFullYear();

// Placeholder options -- real list is Xano's community-master data (see
// docs mentioning Culture/Community), not yet available here. Swap once
// that's wired up.
const CULTURE_OPTIONS = [
  { label: "General", value: "general" },
  { label: "Family", value: "family" },
  { label: "Student", value: "student" },
  { label: "Professional", value: "professional" },
  { label: "Senior", value: "senior" },
];

/**
 * Screen 2 -- visual only, no real backend age check here (that lives in
 * apps/customer-app's AgeGateScreen, which calls the real Xano
 * /pre-auth/check-age endpoint). Under 18 still routes to the SAME Login
 * screen as everyone else -- there is no separate Child screen anywhere in
 * auth. A minor never self-registers here; their parent already created
 * their login credentials via Profile > Child Accounts (see
 * apps/customer-app/screens/child-accounts/), so under-18 just means
 * "log in with the account your parent made for you," not a different UI.
 */
export function AgeGateScreen({ navigation }: Props) {
  const [birthYear, setBirthYear] = useState(String(CURRENT_YEAR - 25));
  const [culture, setCulture] = useState<string | null>(null);
  const yearNumber = Number(birthYear);
  const displayAge = Number.isFinite(yearNumber) && birthYear.length === 4 ? CURRENT_YEAR - yearNumber : null;
  const underage = displayAge !== null && displayAge < 18;

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <View style={[styles.flex, styles.background]}>
        <SafeAreaView style={[styles.flex, styles.center]}>
          <View style={styles.card}>
            <LinearGradient
              colors={["rgba(139, 92, 246, 0.7)", "rgba(249, 115, 22, 0.5)", "rgba(255, 255, 255, 0.15)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardBorder}
            >
              <View style={styles.cardClip}>
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.cardInner}>
                  <View style={styles.iconBadge}>
                    <ShieldCheck color="#FFFFFF" size={28} />
                  </View>

                  <Text style={styles.pill}>Philippine 18+ Security Policy</Text>
                  <Text style={styles.title}>Age Verification</Text>
                  <Text style={styles.subtitle}>
                    Enter your Year of Birth to proceed. RAPEX strictly requires users to be 18 years or older.
                  </Text>

                  <View style={styles.inputWrap}>
                    <Text style={styles.inputLabel}>Enter Year of Birth</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="number-pad"
                      maxLength={4}
                      value={birthYear}
                      onChangeText={setBirthYear}
                    />
                    {displayAge !== null ? <Text style={styles.ageText}>Age: {displayAge} years old</Text> : null}
                  </View>

                  <View style={styles.cultureWrap}>
                    <SelectField
                      label="What is your Culture?"
                      value={culture}
                      options={CULTURE_OPTIONS}
                      onChange={setCulture}
                      placeholder="Select (optional)"
                    />
                  </View>

                  {underage ? (
                    <Text style={styles.noticeText}>
                      You're under 18 -- log in with the account your parent already created for you.
                    </Text>
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
  background: { backgroundColor: "#130C24" },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  card: {
    width: "100%",
    shadowColor: "#B39DDB",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cardBorder: { borderRadius: 24, padding: 1 },
  cardClip: { borderRadius: 23, overflow: "hidden" },
  cardInner: { padding: 24, alignItems: "center", gap: 14, backgroundColor: "rgba(20, 14, 36, 0.55)" },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
  },
  pill: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FB923C",
    backgroundColor: "rgba(249,115,22,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    textTransform: "uppercase",
    overflow: "hidden",
  },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF" },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 18 },
  inputWrap: { width: "100%", gap: 8, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 16 },
  inputLabel: { fontSize: 10, fontWeight: "800", color: "#C4B5FD", textTransform: "uppercase", letterSpacing: 1 },
  input: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#8B5CF6",
    borderRadius: 16,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  ageText: { textAlign: "center", fontSize: 12, fontWeight: "800", color: "#FDBA74" },
  cultureWrap: { width: "100%" },
  noticeText: { color: "#FDBA74", fontSize: 12, textAlign: "center" },
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
