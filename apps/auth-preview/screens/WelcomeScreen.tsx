import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { AuthButton } from "../components/buttons/AuthButton";
import { GradientButton } from "../components/buttons/GradientButton";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

// TODO: swap back to an ImageBackground once a final background image is chosen
// (login-lightbackground.png was removed from assets/images during art rework).

/** Screen 1 -- brand intro with Login / Sign Up choice. Visual only. */
export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.background}>
      <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>RAPEX</Text>
          <Text style={styles.brandSubtitle}>Fast delivery, seamless checkout.</Text>
        </View>

        <View style={styles.actionArea}>
          <GradientButton title="Login" onPress={() => navigation.navigate("AgeGate")} />
          <AuthButton title="Sign Up" onPress={() => navigation.navigate("SignUp")} />
        </View>

        <Text style={styles.footerText}>Secure buyer access, dual-shield verification powered by Xano.</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "flex-end", backgroundColor: "#0F0420" },
  overlay: {
    flex: 1,
    padding: 28,
    justifyContent: "space-between",
  },
  brandContainer: { marginTop: 120 },
  brandTitle: { fontSize: 52, fontWeight: "900", color: "#FFFFFF", letterSpacing: 4 },
  brandSubtitle: {
    marginTop: 12,
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 28,
    maxWidth: "80%",
  },
  actionArea: { gap: 12, marginBottom: 36 },
  footerText: { color: "rgba(255,255,255,0.62)", fontSize: 14, textAlign: "center", marginBottom: 16 },
});
