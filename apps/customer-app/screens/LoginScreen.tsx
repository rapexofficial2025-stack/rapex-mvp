import { useState } from "react";
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import { Hotspot, useToast } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";
import { CATEGORY_HOTSPOTS, TOP_ICON_HOTSPOTS, FloatingReferenceModal, type FloatingKey } from "../components/LoginReferenceOverlays";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

/**
 * LOGIN2 / Screen 2 of the two-stage login flow (see WelcomeScreen.tsx for Screen 1).
 * Background is the real uploaded reference asset (login-dark-2.png) -- the top
 * icon row, 5 category hexagons, glass card outline, and an "OR" divider are
 * already drawn into that artwork (see LoginReferenceOverlays.tsx for the icon/
 * hexagon Hotspot rects). The form content below (title, fields, buttons) is
 * NOT baked into the background -- that area is empty in the real asset -- so
 * it's built here as real, functional components matching
 * login-dark-2-reference.png's styling, not flattened into an image.
 *
 * Google stays disabled-with-toast (no fake auth): it needs an OAuth client
 * ID that doesn't exist yet. Facebook is intentionally not offered here
 * (Google-only per spec). Email/password goes through the real, unchanged
 * AuthRepository. Create an Account routes through the Privacy & Terms
 * consent gate before the registration wizard.
 */
const BACKGROUND = require("../../../assets/brand/Background/login-dark-2.png");
const GOOGLE_ICON = require("../../../assets/brand/icons/google-logo-icon.png");

export function LoginScreen({ navigation }: Props) {
  const { auth } = useRepositories();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [activeFloating, setActiveFloating] = useState<FloatingKey | null>(null);
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <ImageBackground source={BACKGROUND} style={styles.flex} resizeMode="cover">
        <SafeAreaView style={styles.flex} edges={["top"]}>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            {TOP_ICON_HOTSPOTS.login2.map((h) => (
              <Hotspot key={h.key} {...h.rect} label={h.label} onPress={() => setActiveFloating(h.key)} />
            ))}
            {CATEGORY_HOTSPOTS.login2.map((h) => (
              <Hotspot key={h.key} {...h.rect} label={h.label} onPress={() => setActiveFloating(h.key)} />
            ))}

            <View style={styles.cardContent}>
              <ScrollView
                contentContainerStyle={styles.cardScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.title}>Welcome Back!</Text>
                <Text style={styles.subtitle}>Sign in to continue</Text>

                <View style={styles.field}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email or Mobile Number"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                <View style={styles.field}>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>

                <Pressable
                  onPress={() => showToast("Forgot password isn't set up yet -- contact support for now", "neutral")}
                  style={styles.forgotRow}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>

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
                    colors={["#F97316", "#8B5CF6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>{login.loading ? "Logging in..." : "Log In"}</Text>
                  </LinearGradient>
                </Pressable>

                <View style={styles.socialRow}>
                  <Pressable
                    style={[styles.socialButton, styles.googleButton, styles.googleButtonFull]}
                    onPress={() => showToast("Google sign-in requires Firebase configuration -- not connected yet", "neutral")}
                  >
                    <Image source={GOOGLE_ICON} style={styles.socialIcon} resizeMode="contain" />
                    <Text style={styles.googleText}>Continue with Google</Text>
                  </Pressable>
                </View>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Pressable
                  onPress={() => navigation.navigate("PrivacyTerms")}
                  style={({ pressed }) => [styles.primaryButtonWrap, { opacity: pressed ? 0.9 : 1 }]}
                >
                  <LinearGradient
                    colors={["#F97316", "#8B5CF6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>Create an Account</Text>
                  </LinearGradient>
                </Pressable>

                <Text style={styles.footerText}>SEC & BIR Registered. Official Launch: 2026. All Rights Reserved.</Text>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>

      <FloatingReferenceModal activeKey={activeFloating} onClose={() => setActiveFloating(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cardContent: {
    position: "absolute",
    top: "49%",
    bottom: 0,
    left: "6%",
    right: "6%",
  },
  cardScrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 10,
  },
  title: { fontSize: 22, fontWeight: "700", color: "#FFFFFF", textAlign: "center" },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.65)", textAlign: "center", marginBottom: 6 },
  field: { gap: 4 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#FFFFFF",
  },
  forgotRow: { alignItems: "flex-end", marginTop: -2 },
  forgotText: { fontSize: 12, fontWeight: "600", color: "#C4B5FD" },
  errorText: { color: "#FCA5A5", fontSize: 11 },
  primaryButtonWrap: { marginTop: 2 },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  socialRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
  },
  googleButton: { backgroundColor: "#FFFFFF" },
  googleButtonFull: { flex: 1 },
  socialIcon: { width: 15, height: 15 },
  googleText: { fontSize: 12, fontWeight: "600", color: "#1F1F1F" },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.14)" },
  dividerText: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  footerText: {
    fontSize: 9,
    color: "rgba(255,255,255,0.45)",
    textAlign: "center",
    marginTop: 10,
  },
});
