import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { AuthButton } from "../components/buttons/AuthButton";
import { GradientButton } from "../components/buttons/GradientButton";
import { GlassCard } from "../components/cards/GlassCard";
import { InputField } from "../components/ui/InputField";
import { LightGlassBackground } from "../components/ui/LightGlassBackground";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

/** Screen 3 -- email/password + Google, purely visual (see README). Shares the
 * same light background as AgeGate ("1 background only" for both). */
export function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <LightGlassBackground />
      <SafeAreaView style={styles.content} edges={["top", "bottom"]}>
        <View style={styles.brandSection}>
          <Image source={require("../assets/logo/rapex-logo.png")} style={styles.logo} resizeMode="contain" />
          <Image source={require("../assets/logo/rapex-name-only.png")} style={styles.wordmark} resizeMode="contain" />
        </View>

        <View style={styles.loginSection}>
          <GlassCard style={styles.glassCard}>
            <Text style={styles.loginTitle}>Welcome Back</Text>
            <Text style={styles.loginSubtitle}>Sign in to continue using RAPEX.</Text>
            <InputField placeholder="Email or Mobile Number" />
            <InputField placeholder="Password" secureTextEntry />
            <GradientButton title="Sign In" onPress={() => {}} />

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <AuthButton
              title="Continue with Google"
              icon={require("../assets/icons/google-auth-icon.png")}
              variant="glass"
              onPress={() => {}}
            />
            <AuthButton
              title="Create New Account"
              variant="outline"
              onPress={() => navigation.navigate("SignUp")}
            />
          </GlassCard>
        </View>

        <Text style={styles.footerText}>RAPEX Marketplace v1.0</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  brandSection: { flex: 2, alignItems: "center", justifyContent: "center" },
  logo: { width: 310, height: 310 },
  wordmark: { width: 230, height: 55, marginTop: 10 },
  loginSection: { flex: 3 },
  glassCard: {
    width: "100%",
    alignSelf: "center",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
  },
  loginTitle: { fontSize: 28, fontWeight: "700", color: "#2E1065", textAlign: "center", marginBottom: 6 },
  loginSubtitle: { fontSize: 14, color: "rgba(46, 16, 101, 0.7)", textAlign: "center", marginBottom: 24 },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(139,92,246,0.25)" },
  dividerText: { color: "#2E1065", marginHorizontal: 12, fontSize: 12, fontWeight: "600" },
  footerText: { color: "rgba(46, 16, 101, 0.55)", fontSize: 12, textAlign: "center", marginBottom: 16 },
});
