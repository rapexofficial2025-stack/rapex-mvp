import { Image, ImageBackground, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RapexGlassCard, Button } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

/**
 * LOGIN1 / Screen 1 of the two-stage login flow (see LoginScreen.tsx for Screen 2).
 * Reference artwork is `login-dark-1` (RAPEX intro/branding, single "Let's Get
 * Started" hit area) -- not yet uploaded, so this reuses the existing real
 * `login-dark.png` as an isolated TEMP placeholder background. Swap only the
 * `BACKGROUND` constant below once the real asset lands; nothing else here
 * depends on its exact pixels.
 *
 * The CTA is rendered as a normal visible button rather than an invisible
 * `Hotspot` (see @rapex/ui-native) because there is no "Let's Get Started"
 * artwork under it yet -- an invisible tap zone over a generic background
 * would look broken. Once login-dark-1.png is in, replace this Button with a
 * `Hotspot` positioned/sized (in %) to match the artwork's own button.
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
            <Text style={styles.tagline}>Gawang Lokal, Para sa Masa</Text>
          </View>

          <View style={styles.ctaWrap}>
            <RapexGlassCard style={styles.ctaCard}>
              <Text style={styles.ctaTitle}>Marketplace, food, services, and auctions -- all in one app.</Text>
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
  tagline: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600", letterSpacing: 0.4 },
  ctaWrap: { paddingHorizontal: 20, paddingBottom: 24 },
  ctaCard: { padding: 20, gap: 14 },
  ctaTitle: { color: "#FFFFFF", fontSize: 14, textAlign: "center", lineHeight: 20 },
});
