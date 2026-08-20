import { useEffect, useRef, useState } from "react";
import { Animated, ImageBackground, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ArrowRight, Calendar, Globe } from "lucide-react-native";
import type { AuthStackParamList } from "../App";
import { SelectField } from "../components/ui/SelectField";
import { setSignUpCulture } from "../services/signUpDraftStore";

type Props = NativeStackScreenProps<AuthStackParamList, "AgeGate">;

const CURRENT_YEAR = new Date().getFullYear();
const AGE_BACKGROUND = require("../assets/backgrounds/age-screen.png");

// The 8 examples given directly -- real source is Xano's GET
// /rapex-core/community-master (community_master: id, name, description,
// is_active), which has the complete 14-item list. Swap this hardcoded
// array for that fetch once auth-preview (or its successor) is wired to
// real endpoints.
const CULTURE_OPTIONS = [
  { label: "Tagalog", value: "tagalog" },
  { label: "Cebuano / Bisaya", value: "bisaya" },
  { label: "Ilocano", value: "ilocano" },
  { label: "Tausug", value: "tausug" },
  { label: "Zamboangueño", value: "zamboangueno" },
  { label: "Waray", value: "waray" },
  { label: "Samal", value: "samal" },
  { label: "Bicolano", value: "bicolano" },
  { label: "Other", value: "other" },
];

const CULTURE_GREETINGS: Record<string, string> = {
  tagalog: "Salamat, Kaibigan!",
  bisaya: "Daghang Salamat!",
  ilocano: "Agyamanak, Gayyem!",
  tausug: "Salamat, Ka Tausug!",
  zamboangueno: "¡Bienvenido, Amigo!",
  waray: "Damo nga Salamat!",
  samal: "Magsukul!",
  bicolano: "Dios Mabalos!",
  other: "Salamat, Ka RAPEX!",
};

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
  const { height } = useWindowDimensions();
  const [birthYear, setBirthYear] = useState(String(CURRENT_YEAR - 25));
  const [culture, setCulture] = useState<string | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const formOpacity = useRef(new Animated.Value(1)).current;
  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const greetingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const yearNumber = Number(birthYear);
  const displayAge = Number.isFinite(yearNumber) && birthYear.length === 4 ? CURRENT_YEAR - yearNumber : null;
  const underage = displayAge !== null && displayAge < 18;
  const greeting = CULTURE_GREETINGS[culture ?? "other"];

  useEffect(() => {
    return () => {
      if (greetingTimeout.current) clearTimeout(greetingTimeout.current);
    };
  }, []);

  function handleConfirm() {
    Animated.timing(formOpacity, { toValue: 0, duration: 280, useNativeDriver: true }).start(() => {
      setShowGreeting(true);
      Animated.timing(greetingOpacity, { toValue: 1, duration: 320, useNativeDriver: true }).start(() => {
        greetingTimeout.current = setTimeout(() => navigation.navigate("Login"), 3000);
      });
    });
  }

  return (
    <ImageBackground source={AGE_BACKGROUND} resizeMode="cover" style={styles.flex}>
      <StatusBar style="dark" />
      <SafeAreaView style={[styles.flex, styles.center]}>
          <View style={[styles.cardStage, { transform: [{ translateY: height * 0.1 }] }]}>
            <Animated.View pointerEvents={showGreeting ? "none" : "auto"} style={[styles.card, { opacity: formOpacity }]}>
              <View style={styles.cardInner}>
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
                      dropdownMode="inline"
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
                    onPress={handleConfirm}
                    style={({ pressed }) => [styles.ctaWrap, { opacity: pressed ? 0.9 : 1 }]}
                  >
                    <LinearGradient
                      colors={["#8B5CF6", "#6366F1", "#F97316"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.ctaBorder}
                    >
                      <LinearGradient
                      colors={["#8B5CF6", "#6366F1", "#F97316"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.ctaButton}
                    >
                      <LinearGradient
                        colors={["rgba(255,255,255,0.48)", "rgba(255,255,255,0)"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.ctaReflection}
                        pointerEvents="none"
                      />
                      <Text style={styles.ctaText}>{underage ? "Log In" : "Confirm Age & Continue"}</Text>
                      <ArrowRight color="#FFFFFF" size={16} />
                      </LinearGradient>
                    </LinearGradient>
                  </Pressable>
              </View>
            </Animated.View>
            {showGreeting ? (
              <Animated.View style={[styles.greetingLayer, { opacity: greetingOpacity }]}>
                <Text style={styles.greetingText}>{greeting}</Text>
              </Animated.View>
            ) : null}
          </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal:10 },
  card: {
    width: "100%",
  },
  cardStage: { width: "100%" },
  cardInner: { padding: 24, alignItems: "center", gap: 14,bottom:20, backgroundColor: "transparent" },
  pill: {
    fontSize: 12,
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
  title: { fontSize: 26,bottom: 6, fontWeight: "800", color: "#2E1065",marginBottom: -10},
  subtitle: { fontSize: 14,bottom: 5, color: "rgba(46, 16, 101, 0.9)", textAlign: "center", lineHeight: 18 },
  field: { width: "100%", gap: 6 },
  inputLabel: { fontSize: 16, fontWeight: "700", color: "rgba(46,16,101,0.8)" },
  inputWrap: { position: "relative", height: 58, justifyContent: "center", marginRight: -15, right: 10 },
  inputIcon: { position: "absolute", left: 16, zIndex: 1 },
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
    right: -3,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  ageChip: {
    position: "absolute",
    right: 15,
    backgroundColor: "rgba(220,252,231,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  ageChipText: { fontSize: 14, fontWeight: "800", color: "#15803D" },
  cultureWrap: { width: "105%" },
  noticeBox: {
    width: "100%",
    backgroundColor: "rgba(254,215,170,0.6)",
    borderWidth: 1,
    borderColor: "rgba(234,88,12,0.28)",
    borderRadius: 14,
    padding: 12,
    bottom: 20,
  },
  noticeText: { color: "#9A3412", fontSize: 15, textAlign: "center", fontWeight: "600", lineHeight: 20 },
  ctaWrap: {
    width: "100%",
    marginTop: 4,
    shadowColor: "#FFFFFF",
    shadowOpacity: 84,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  ctaBorder: { borderRadius: 18, padding: 1.5 },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom:1,
    paddingVertical: 10,
    borderRadius: 16.5,
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.99,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: -1 },
  },
  ctaReflection: { position: "absolute", top: 1.1, left: 1.5, right: 1.5, height: "48%", borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  ctaText: { color: "#FFFFFF", fontWeight: "800", fontSize: 19 },
  greetingLayer: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  greetingText: { color: "#802515", fontSize: 34, fontWeight: "800",bottom:50, textAlign: "center", textShadowColor: "rgba(255,255,255,0.7)", textShadowRadius: 8 },
});
