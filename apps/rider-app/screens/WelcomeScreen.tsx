import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RapexGlassCard, Button } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

/**
 * LOGIN1 / Screen 1 of the two-stage login flow (see LoginScreen.tsx for Screen 2).
 * Same architecture and TEMP-placeholder rationale as customer-app's WelcomeScreen.tsx
 * -- reference artwork `login-dark-1` isn't uploaded yet, so this reuses the existing
 * real `login-dark.png`. "Create Rider Account" moved to the LoginScreen footer link
 * (matches customer-app's pattern) since Screen 1 has a single hit area only.
 */
const BACKGROUND = require("../../../assets/brand/Background/login-dark.png");
const LOGO = require("../../../assets/brand/Branding Logo (Available)/Wordmark-logo-v3.png");

export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <ImageBackground source={BACKGROUND} style={styles.flex} resizeMode="cover">
        <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
          <View style={styles.hero}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tagline}>Earn by delivering for your community.</Text>
          </View>

          <View style={styles.ctaWrap}>
            <RapexGlassCard style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>Flexible hours. Real payouts. Your neighborhood, your routes.</Text>
              <Button label="Let's Get Started" onPress={() => navigation.navigate("Login")} />
            </RapexGlassCard>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { flex: 2, alignItems: "center", justifyContent: "center", gap: 8 },
  logo: { width: "70%", aspectRatio: 2.3 },
  tagline: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600", letterSpacing: 0.4, textAlign: "center", paddingHorizontal: 24 },
  ctaWrap: { paddingHorizontal: 20, paddingBottom: 24 },
  ctaCard: { padding: 20, gap: 14 },
  ctaTitle: { color: "#FFFFFF", fontSize: 14, textAlign: "center", lineHeight: 20 },
});
