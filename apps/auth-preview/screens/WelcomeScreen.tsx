import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { AuthButton } from "../components/buttons/AuthButton";
import { GradientButton } from "../components/buttons/GradientButton";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

const BACKGROUND = require("../assets/backgrounds/login-lightbackground.png");

/** Screen 1 -- brand intro with Login / Sign Up choice. Visual only. */
export function WelcomeScreen({ navigation }: Props) {
  return (
    <ImageBackground source={BACKGROUND} resizeMode="cover" style={styles.background}>
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "flex-end" },
  overlay: {
    flex: 1,
    padding: 28,
    justifyContent: "space-between",
    backgroundColor: "rgba(10, 12, 24, 0.62)",
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
