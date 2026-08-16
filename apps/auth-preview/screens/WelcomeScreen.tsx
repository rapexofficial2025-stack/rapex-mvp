import { useState } from "react";
import { Image, ImageBackground, ImageSourcePropType, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, HelpCircle, Link2, Menu, MessageCircle } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { SlideToContinueButton } from "../components/ui/SlideToContinueButton";
import { FeaturePreviewModal } from "../components/ui/FeaturePreviewModal";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

// Reusing the existing login background until a dedicated hero image exists --
// swap this path once one is ready.
const HERO_BACKGROUND = require("../assets/backgrounds/login-dark-1.png");
const RAPEX_LOGO = require("../assets/logo/rapex-logo.png");
const RAPEX_WORDMARK = require("../assets/logo/rapex-name-only.png");

type FeatureKey = "stores" | "community" | "food" | "serviceProvider" | "auction";

// icon: reusing your existing icon pack (same files LoginScreen used to
// reference). preview: TEMPORARY, reusing the same icon image as a
// stand-in for the real floating info-graphic -- no dedicated preview
// images exist yet. Swap `preview` to a real assets/previews/*.png once
// you have one; `icon` doesn't need to change.
const FEATURES: { key: FeatureKey; label: string; icon: ImageSourcePropType; preview: ImageSourcePropType }[] = [
  {
    key: "stores",
    label: "STORES",
    icon: require("../assets/icons/store-icon.png"),
    preview: require("../assets/icons/store-icon.png"),
  },
  {
    key: "community",
    label: "COMMUNITY",
    icon: require("../assets/icons/community-icon.png"),
    preview: require("../assets/icons/community-icon.png"),
  },
  {
    key: "food",
    label: "FOOD",
    icon: require("../assets/icons/cook-food-icon.png"),
    preview: require("../assets/icons/cook-food-icon.png"),
  },
  {
    key: "serviceProvider",
    label: "SERVICE\nPROVIDER",
    icon: require("../assets/icons/services-icon.png"),
    preview: require("../assets/icons/services-icon.png"),
  },
  {
    key: "auction",
    label: "AUCTION",
    icon: require("../assets/icons/auction-icon.png"),
    preview: require("../assets/icons/auction-icon.png"),
  },
];

/**
 * Screen 1 -- landing/onboarding page. Visual only: quick-link pills, the
 * hex feature-preview buttons, and the age-gate handoff are all local;
 * nothing here calls a backend (see README). Carousel dots at the bottom are
 * decorative only for now (not a swipeable multi-page carousel yet).
 */
export function WelcomeScreen({ navigation }: Props) {
  const [activePreview, setActivePreview] = useState<ImageSourcePropType | null>(null);

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.header}>
            <Pressable hitSlop={10}>
              <Menu color="#FFFFFF" size={24} />
            </Pressable>
            <Text style={styles.headerTitle}>RAPEX Marketplace PH</Text>
            <Pressable hitSlop={10}>
              <Bell color="#FFFFFF" size={22} />
            </Pressable>
          </View>

          <View style={styles.quickRow}>
            <View style={styles.quickPill}>
              <MessageCircle color="#FFFFFF" size={16} />
              <Text style={styles.quickPillText}>Chat</Text>
            </View>
            <View style={styles.quickDivider} />
            <View style={styles.quickPill}>
              <Link2 color="#FFFFFF" size={16} />
              <Text style={styles.quickPillText}>Page</Text>
            </View>
            <View style={styles.quickDivider} />
            <View style={styles.quickPill}>
              <HelpCircle color="#FFFFFF" size={16} />
              <Text style={styles.quickPillText}>FAQ</Text>
            </View>
          </View>
        </SafeAreaView>

        <ImageBackground source={HERO_BACKGROUND} resizeMode="cover" style={styles.hero}>
          <View style={styles.heroOverlay}>
            <Image source={RAPEX_LOGO} style={styles.heroLogo} resizeMode="contain" />
            <Image source={RAPEX_WORDMARK} style={styles.heroWordmark} resizeMode="contain" />
            <Text style={styles.heroTagline}>
              DELIVERING THE FUTURE, <Text style={styles.heroTaglineAccent}>TODAY.</Text>
            </Text>

            <Text style={styles.heroHeadline}>
              ANG BAGONG <Text style={styles.heroHeadlineAccent}>APP</Text>
              {"\n"}
              NA PARA SA <Text style={styles.heroHeadlineAccent}>MASA</Text>
            </Text>
            <View style={styles.heroDivider} />
          </View>
        </ImageBackground>

        <View style={styles.featureRow}>
          {FEATURES.map((feature) => (
            <Pressable key={feature.key} style={styles.featureButton} onPress={() => setActivePreview(feature.preview)}>
              <View style={styles.featureHex}>
                <Image source={feature.icon} style={styles.featureIcon} resizeMode="contain" />
              </View>
              <Text style={styles.featureLabel}>{feature.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.ctaArea}>
          <SlideToContinueButton label="Let's get Started" onComplete={() => navigation.navigate("AgeGate")} />
        </View>

        <View style={styles.footerBox}>
          <Text style={styles.footerText}>© 2026 Rapex Technologies OPC™</Text>
          <Text style={styles.footerText}>SEC & BIR Registered. Official Launch: 2026.</Text>
          <Text style={styles.footerText}>All Rights Reserved.</Text>
        </View>

        <Text style={styles.footerTagline}>KAHIT SAAN, KAHIT KAILAN.</Text>

        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </ScrollView>

      <FeaturePreviewModal visible={activePreview !== null} image={activePreview} onClose={() => setActivePreview(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0B0713" },
  scrollContent: { paddingBottom: 32 },
  headerSafe: { backgroundColor: "#0B0713" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },
  headerTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  quickPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14 },
  quickPillText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  quickDivider: { width: 1, height: 16, backgroundColor: "rgba(255,255,255,0.2)" },
  hero: { width: "100%", aspectRatio: 0.82, justifyContent: "flex-end" },
  heroOverlay: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 20 },
  heroLogo: { width: 130, height: 90 },
  heroWordmark: { width: 220, height: 60, marginTop: 4 },
  heroTagline: { color: "#FFFFFF", fontSize: 12, fontWeight: "700", letterSpacing: 1, marginTop: 6 },
  heroTaglineAccent: { color: "#F97316" },
  heroHeadline: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 16,
    lineHeight: 30,
  },
  heroHeadlineAccent: { color: "#F97316" },
  heroDivider: { width: 90, height: 4, borderRadius: 2, backgroundColor: "#F97316", marginTop: 12 },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  featureButton: { alignItems: "center", width: 62 },
  featureHex: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(139, 92, 246, 0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureIcon: { width: 30, height: 30 },
  featureLabel: {
    marginTop: 6,
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  ctaArea: { paddingHorizontal: 20, marginBottom: 20 },
  footerBox: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    gap: 2,
  },
  footerText: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  footerTagline: {
    textAlign: "center",
    color: "#C4B5FD",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 14,
  },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 14 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { width: 20, backgroundColor: "#FFFFFF" },
});
