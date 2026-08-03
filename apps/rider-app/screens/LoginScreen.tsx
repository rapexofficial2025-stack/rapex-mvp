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
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const BACKGROUND = require("../../../assets/brand/Background/login-dark.png");
const LOGO = require("../../../assets/brand/Branding Logo (Available)/Wordmark-logo-v3.png");
const GOOGLE_ICON = require("../../../assets/icons/Home Icon/google.png");
const FACEBOOK_ICON = require("../../../assets/icons/Home Icon/facebook.png");

export function LoginScreen({ navigation }: Props) {
  const { auth } = useRepositories();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <ImageBackground source={BACKGROUND} style={styles.flex} resizeMode="cover">
        <SafeAreaView style={styles.flex} edges={["top"]}>
          <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={styles.hero}>
              <Image source={LOGO} style={styles.logo} resizeMode="contain" />
              <Text style={styles.heroSubtitle}>Rider Log In</Text>
            </View>

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
                  <Text style={styles.title}>Welcome Back, Boss!</Text>
                  <Text style={styles.subtitle}>Log in to start accepting deliveries</Text>

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
                    <View style={styles.fieldLabelRow}>
                      <Text style={styles.fieldLabel}>Password</Text>
                      <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
                        <Text style={styles.forgotLink}>Forgot password?</Text>
                      </Pressable>
                    </View>
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
                      navigation.navigate("MainTabs");
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
                    <Pressable style={styles.socialButton}>
                      <Image source={GOOGLE_ICON} style={styles.socialIcon} resizeMode="contain" />
                      <Text style={styles.socialText}>Google</Text>
                    </Pressable>
                    <Pressable style={styles.socialButton}>
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
    justifyContent: "center",
  },
  logo: { width: "80%", aspectRatio: 2.3 },
  heroSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "600", marginTop: 8, letterSpacing: 0.5 },
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
  fieldLabelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  fieldLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  forgotLink: { fontSize: 11, fontWeight: "600", color: "#C4B5FD" },
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
  socialIcon: { width: 15, height: 15 },
  socialText: { fontSize: 12, fontWeight: "600", color: "#FFFFFF" },
  footerRow: { alignItems: "center", marginTop: 4 },
  footerText: { fontSize: 12, color: "rgba(255,255,255,0.65)" },
  footerLink: { color: "#C4B5FD", fontWeight: "700" },
});
