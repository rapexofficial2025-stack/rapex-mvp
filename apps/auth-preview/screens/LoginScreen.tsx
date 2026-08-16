import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { AuthButton } from "../components/buttons/AuthButton";
import { GradientButton } from "../components/buttons/GradientButton";
import { GlassCard } from "../components/cards/GlassCard";
import { InputField } from "../components/ui/InputField";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

// TODO: swap back to an ImageBackground once a final background image is chosen
// (login-lightbackground.png was removed from assets/images during art rework).
const HEX_ICONS = [
  require("../assets/icons/store-icon.png"),
  require("../assets/icons/cook-food-icon.png"),
  require("../assets/icons/services-icon.png"),
  require("../assets/icons/auction icon.png"),
  require("../assets/icons/rider-icon.png"),
];

/** Screen 3 -- email/password + Google, purely visual (see README). */
export function LoginScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content} edges={["top", "bottom"]}>
        <View style={styles.hexRow}>
          {HEX_ICONS.map((icon, i) => (
            <View key={i} style={styles.hexButton}>
              <Image source={icon} style={styles.hexIcon} />
            </View>
          ))}
        </View>

        <View style={styles.brandSection}>
          <Image source={require("../assets/logo/rapex-logo.png")} style={styles.logo} resizeMode="contain" />
          <Image source={require("../assets/logo/rapex-name-only.png")} style={styles.wordmark} resizeMode="contain" />
          <Image source={require("../assets/logo/masa-white-tagline.png")} style={styles.tagline} resizeMode="contain" />
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
              icon={require("../assets/icons/google-logo-icon.png")}
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
  container: { flex: 1, backgroundColor: "#0F0420" },
  content: { flex: 1 },
  hexRow: { height: 90, flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" },
  hexButton: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  hexIcon: { width: 28, height: 28 },
  brandSection: { flex: 2, alignItems: "center", justifyContent: "center" },
  logo: { width: 110, height: 110 },
  wordmark: { width: 230, height: 55, marginTop: 10 },
  tagline: { width: 220, height: 24, marginTop: 6 },
  loginSection: { flex: 3 },
  glassCard: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  loginTitle: { fontSize: 28, fontWeight: "700", color: "#FFFFFF", textAlign: "center", marginBottom: 6 },
  loginSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.70)", textAlign: "center", marginBottom: 24 },
  dividerContainer: { flexDirection: "row", alignItems: "center", marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.18)" },
  dividerText: { color: "#FFFFFF", marginHorizontal: 12, fontSize: 12, fontWeight: "600" },
  footerText: { color: "rgba(255,255,255,0.55)", fontSize: 12, textAlign: "center", marginBottom: 16 },
});
