import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ShieldCheck, ArrowRight } from "lucide-react-native";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import { RapexGlassCard } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "AgeGate">;

const CURRENT_YEAR = new Date().getFullYear();

/**
 * First real gate after "Let's get Started" -- collects birth year and
 * calls the real backend age check (POST /pre-auth/check-age), which
 * enforces RAPEX's 18+ policy with a real 48-hour device/IP lockout on
 * failure. A purely local year>=18 check can't enforce that lockout, so
 * this always asks the backend rather than deciding client-side.
 */
export function AgeGateScreen({ navigation }: Props) {
  const { auth } = useRepositories();
  const [birthYear, setBirthYear] = useState(String(CURRENT_YEAR - 25));
  const checkAge = useAsyncAction((year: number) => auth.checkAge(year));
  const yearNumber = Number(birthYear);
  const displayAge = Number.isFinite(yearNumber) && birthYear.length === 4 ? CURRENT_YEAR - yearNumber : null;

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <View style={[styles.flex, styles.background]}>
        <SafeAreaView style={[styles.flex, styles.center]}>
          <RapexGlassCard style={styles.card}>
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

              {checkAge.error ? <Text style={styles.errorText}>{checkAge.error}</Text> : null}

              <Pressable
                disabled={checkAge.loading || birthYear.length !== 4}
                onPress={async () => {
                  try {
                    await checkAge.execute(yearNumber);
                    navigation.navigate("Login");
                  } catch {
                    navigation.navigate("IpLockout");
                  }
                }}
                style={({ pressed }) => [styles.ctaWrap, { opacity: pressed ? 0.9 : 1 }]}
              >
                <LinearGradient
                  colors={["#8B5CF6", "#6366F1", "#F97316"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaButton}
                >
                  <Text style={styles.ctaText}>{checkAge.loading ? "Checking…" : "Confirm Age & Continue"}</Text>
                  <ArrowRight color="#FFFFFF" size={16} />
                </LinearGradient>
              </Pressable>
            </View>
          </RapexGlassCard>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  background: { backgroundColor: "#130C24" },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  card: { width: "100%" },
  cardInner: { padding: 24, alignItems: "center", gap: 14 },
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
  errorText: { color: "#FCA5A5", fontSize: 12, textAlign: "center" },
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
