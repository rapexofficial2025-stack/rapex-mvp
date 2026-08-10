import { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import { useToast } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

/**
 * LOGIN2 / Screen 2 of the two-stage login flow (see WelcomeScreen.tsx for Screen 1).
 * Reference artwork is `login-dark-2` -- not yet uploaded, so this reuses the existing
 * real `login-dark.png` as an isolated TEMP placeholder background (same constant name
 * as Screen 1's, both point at one real file, both get swapped together). All controls
 * below stay real, visible, functional inputs for now; once login-dark-2.png lands,
 * fields/buttons that duplicate its drawn artwork are candidates to convert to
 * `Hotspot` (@rapex/ui-native) positioned over that artwork instead.
 */
const BACKGROUND = require("../../../assets/brand/Background/login-dark.png");
const LOGO = require("../../../assets/brand/Branding Logo (Available)/Wordmark-logo-v3.png");
const GOOGLE_ICON = require("../../../assets/icons/Home Icon/google.png");
const FACEBOOK_ICON = require("../../../assets/icons/Home Icon/facebook.png");

type FeatureKey = "marketplace" | "food" | "services" | "auction";

const FEATURE_ICONS: { key: FeatureKey; emoji: string; label: string; color: string; image: number }[] = [
  {
    key: "marketplace",
    emoji: "🛍️",
    label: "MARKETPLACE",
    color: "#7C3AED",
    image: require("../../../assets/images/reference/Login-marketplace.png"),
  },
  {
    key: "food",
    emoji: "🍽️",
    label: "FOOD",
    color: "#F97316",
    image: require("../../../assets/images/reference/login-info-food.png"),
  },
  {
    key: "services",
    emoji: "🛠️",
    label: "SERVICES",
    color: "#7C3AED",
    image: require("../../../assets/images/reference/login-services-info.png"),
  },
  {
    key: "auction",
    emoji: "🔨",
    label: "AUCTION",
    color: "#F97316",
    image: require("../../../assets/images/reference/login-auction.png"),
  },
];

export function LoginScreen({ navigation }: Props) {
  const { auth } = useRepositories();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));

  const activeFeatureData = FEATURE_ICONS.find((f) => f.key === activeFeature);

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <ImageBackground source={BACKGROUND} style={styles.flex} resizeMode="cover">
        <SafeAreaView style={styles.flex} edges={["top"]}>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.hero}>
              <View style={styles.iconRow}>
                {FEATURE_ICONS.map((feature) => (
                  <Pressable
                    key={feature.key}
                    style={styles.iconButton}
                    onPress={() => setActiveFeature(feature.key)}
                  >
                    <View style={[styles.iconBadge, { backgroundColor: feature.color }]}>
                      <Text style={styles.iconEmoji}>{feature.emoji}</Text>
                    </View>
                    <Text style={styles.iconLabel}>{feature.label}</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.logoWrap}>
                <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              </View>
            </View>

            <Modal visible={activeFeatureData != null} transparent animationType="fade" onRequestClose={() => setActiveFeature(null)}>
              <View style={styles.modalBackdrop}>
                <View style={styles.modalPanel}>
                  <Pressable style={styles.modalClose} onPress={() => setActiveFeature(null)}>
                    <Text style={styles.modalCloseText}>✕</Text>
                  </Pressable>
                  {activeFeatureData ? (
                    <Image source={activeFeatureData.image} style={styles.modalImage} resizeMode="contain" />
                  ) : null}
                </View>
              </View>
            </Modal>

            <View style={styles.sheetWrap}>
              <LinearGradient
                colors={["rgba(6,4,12,0.92)", "rgba(22,10,38,0.88)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sheet}
              >
                <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
                <View style={styles.sheetHighlight} pointerEvents="none" />

                <ScrollView
                  contentContainerStyle={styles.sheetContent}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View style={styles.sheetHandle} />
                  <Text style={styles.title}>Welcome Back, Tropa!</Text>
                  <Text style={styles.subtitle}>Log in to keep ordering with RAPEX</Text>

                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="you@email.com"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.fieldLabel}>Password</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>

                  {login.error ? <Text style={styles.errorText}>{login.error}</Text> : null}

                  <Pressable
                    onPress={async () => {
                      await login.execute({ email, password });
                      navigation.navigate("Otp", { destination: "login" });
                    }}
                    disabled={login.loading}
                    style={({ pressed }) => [styles.primaryButtonWrap, { opacity: pressed ? 0.9 : 1 }]}
                  >
                    <LinearGradient
                      colors={["#8B5CF6", "#F97316"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>{login.loading ? "Logging in..." : "Log In"}</Text>
                    </LinearGradient>
                  </Pressable>

                  <View style={styles.dividerRow}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>or continue with</Text>
                    <View style={styles.dividerLine} />
                  </View>

                  <View style={styles.socialRow}>
                    <Pressable
                      style={[styles.socialButton, styles.socialButtonDisabled]}
                      onPress={() => showToast("Google sign-in requires Firebase configuration -- not connected yet", "neutral")}
                    >
                      <Image source={GOOGLE_ICON} style={styles.socialIcon} resizeMode="contain" />
                      <Text style={styles.socialText}>Google</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.socialButton, styles.socialButtonDisabled]}
                      onPress={() => showToast("Facebook sign-in requires Firebase configuration -- not connected yet", "neutral")}
                    >
                      <Image source={FACEBOOK_ICON} style={styles.socialIcon} resizeMode="contain" />
                      <Text style={styles.socialText}>Facebook</Text>
                    </Pressable>
                  </View>

                  <Pressable style={styles.footerRow} onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.footerText}>
                      Don't have an account? <Text style={styles.footerLink}>Register</Text>
                    </Text>
                  </Pressable>
                </ScrollView>
              </LinearGradient>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: {
    flex: 3,
    alignItems: "center",
    paddingTop: 12,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    paddingHorizontal: 12,
  },
  iconButton: { alignItems: "center", gap: 4 },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  iconEmoji: { fontSize: 22 },
  iconLabel: { fontSize: 9, fontWeight: "700", color: "#FFFFFF", letterSpacing: 0.4 },
  logoWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { width: "80%", aspectRatio: 2.3 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  modalPanel: {
    position: "absolute",
    top: 10,
    bottom: 5,
    left: 5,
    right: 5,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#0B0713",
  },
  modalClose: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modalCloseText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  modalImage: { width: "100%", height: "100%" },
  sheetWrap: {
    flex: 2,
    width: "100%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    shadowColor: "#000000",
    shadowOpacity: 0.5,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 10,
  },
  sheet: { flex: 1 },
  sheetHighlight: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  sheetContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    gap: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 36,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 6,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#FFFFFF" },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: -2, marginBottom: 4 },
  field: { gap: 4 },
  fieldLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#FFFFFF",
  },
  errorText: { color: "#FCA5A5", fontSize: 11 },
  primaryButtonWrap: { marginTop: 2 },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.14)" },
  dividerText: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  socialRow: { flexDirection: "row", gap: 10 },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    paddingVertical: 10,
  },
  socialButtonDisabled: { opacity: 0.55 },
  socialIcon: { width: 15, height: 15 },
  socialText: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
  footerRow: { alignItems: "center", marginTop: 4 },
  footerText: { fontSize: 12, color: "rgba(255,255,255,0.65)" },
  footerLink: { color: "#C4B5FD", fontWeight: "700" },
});
