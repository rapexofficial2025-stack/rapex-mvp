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
import type { AuthStackParamList } from "../App";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const BACKGROUND = require("../assets/backgrounds/login-dark-2.png");
const GOOGLE_ICON = require("../assets/icons/google-logo-icon.png");

/**
 * Screen 3 -- visual only. No real login call, no Google auth SDK (that's
 * exactly the dependency that crashed the real app's Login screen when
 * unconfigured -- left out here entirely since this project has nowhere
 * for a real session to go anyway). Both buttons just show a status line
 * under the form instead of doing anything real.
 */
export function LoginScreen({}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <ImageBackground source={BACKGROUND} style={styles.flex} resizeMode="cover">
        <SafeAreaView style={styles.flex} edges={["top"]}>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
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
                    placeholder="Email"
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

                <Pressable onPress={() => setStatus("Forgot Password tapped (not wired here)")} style={styles.forgotRow}>
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </Pressable>

                {status ? <Text style={styles.statusText}>{status}</Text> : null}

                <Pressable
                  onPress={() => setStatus(`Log In tapped (${email || "no email entered"}) -- not wired here`)}
                  style={({ pressed }) => [styles.primaryButtonWrap, { opacity: pressed ? 0.9 : 1 }]}
                >
                  <LinearGradient
                    colors={["#F97316", "#8B5CF6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    <Text style={styles.primaryButtonText}>Log In</Text>
                  </LinearGradient>
                </Pressable>

                <View style={styles.socialRow}>
                  <Pressable
                    style={[styles.socialButton, styles.googleButton, styles.googleButtonFull]}
                    onPress={() => setStatus("Continue with Google tapped -- not wired here")}
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
                  onPress={() => setStatus("Create an Account tapped -- not wired here")}
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
  statusText: { color: "#FDE68A", fontSize: 11 },
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
