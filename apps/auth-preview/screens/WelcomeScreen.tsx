import { useState } from "react";
import { Image, ImageBackground, ImageSourcePropType, Linking, Modal, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, HelpCircle, Link2, Menu, MessageCircle, Phone } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";
import { DeliverySlider } from "../components/ui/DeliverySlider";
import { FeaturePreviewModal } from "../components/ui/FeaturePreviewModal";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;
// Reusing the existing login background until a dedicated hero image exists --
// swap this path once one is ready.
const HERO_BACKGROUND = require("../assets/backgrounds/login-dark-1.png");
const RAPEX_LOGO = require("../assets/logo/rapex-logo.png");
const RAPEX_WORDMARK = require("../assets/logo/rapex-name-only.png");

type FeatureKey = "stores" | "community" | "food" | "serviceProvider" | "auction";

const FAQ_ITEMS = [
  ["What is RAPEX?", "RAPEX Marketplace PH is a local marketplace that connects communities, products, and services."],
  ["What is RAPEX's mission?", "To make everyday commerce more accessible, trusted, and useful for every Filipino community."],
  ["What is RAPEX's vision?", "A connected marketplace where local opportunities can reach everyone, anywhere."],
  ["How is my privacy protected?", "RAPEX respects your personal information and uses it only to provide and improve the marketplace experience."],
  ["Where can I get help?", "Open Support from the top bar for available assistance channels and contact details."],
] as const;

// icon: reusing your existing icon pack (same files LoginScreen used to
// reference). preview: TEMPORARY, reusing the same icon image as a
// stand-in for the real floating info-graphic -- no dedicated preview
// images exist yet. Swap `preview` to a real assets/previews/*.png once
// you have one; `icon` doesn't need to change.
const FEATURES: {
  key: FeatureKey;
  label: string;
  icon: ImageSourcePropType;
  previews: ImageSourcePropType[];
}[] = [
  {
    key: "stores",
    label: "STORES\n",
    icon: require("../assets/categories/store.png"),
    previews: [
      require("../assets/marketing poster/store-poster.png"),
      require("../assets/marketing poster/hardware-poster.png"),
      require("../assets/marketing poster/a1.png"),
      require("../assets/marketing poster/a2.png"),
      require("../assets/marketing poster/a3.png"),
    ],
  },
  {
    key: "food",
    label: "FOOD",
    icon: require("../assets/categories/food.png"),
    previews: [
      require("../assets/marketing poster/localfood-poster.png"),
      require("../assets/marketing poster/food-poster.png"),
      require("../assets/marketing poster/b1.png"),
      require("../assets/marketing poster/b2.png"),
      require("../assets/marketing poster/b3.png"),
    ],
  },
  {
    key: "auction",
    label: "AUCTION",
    icon: require("../assets/categories/auction.png"),
    previews: [
      require("../assets/marketing poster/auction-poster.png"),
      require("../assets/marketing poster/c1.png"),
      require("../assets/marketing poster/c2.png"),
      require("../assets/marketing poster/c3.png"),
      require("../assets/marketing poster/c4.png"),
    ],
  },
  {
    key: "serviceProvider",
    label: "SERVICES",
    icon: require("../assets/categories/service.png"),
    previews: [
      require("../assets/marketing poster/service-poster.png"),
      require("../assets/marketing poster/d1.png"),
      require("../assets/marketing poster/d2.png"),
      require("../assets/marketing poster/d3.png"),
      require("../assets/marketing poster/d4.png"),
    ],
  },
  {
    key: "community",
    label: "MARKET\n",
    icon: require("../assets/categories/market.png"),
    previews: [
      require("../assets/marketing poster/wetmarket-poster.png"),
      require("../assets/marketing poster/agrifarm-poster.png"),
      require("../assets/marketing poster/e1.png"),
      require("../assets/marketing poster/e2.jpg"),
      require("../assets/marketing poster/e3.png"),
    ],
  },
];

/**
 * Screen 1 -- landing/onboarding page. Visual only: quick-link pills, the
 * hex feature-preview buttons, and the age-gate handoff are all local;
 * nothing here calls a backend (see README). Carousel dots at the bottom are
 * decorative only for now (not a swipeable multi-page carousel yet).
 */
export function WelcomeScreen({ navigation }: Props) {
  const [activePreview, setActivePreview] = useState<ImageSourcePropType[] | null>(null);
  const [showFaq, setShowFaq] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  return (
    <ImageBackground
  source={HERO_BACKGROUND}
  resizeMode="cover"
  style={styles.page}
>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.content}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.header}>
            <Pressable hitSlop={10}>
              <Menu color="#000000" size={24} />
            </Pressable>
            <Text style={styles.headerTitle}>RAPEX Marketplace PH</Text>
            <Pressable hitSlop={10}>
              <Bell color="#000000" size={22} />
            </Pressable>
          </View>

          <View style={styles.quickRow}>
            <View style={styles.quickGroup}>
              <Pressable hitSlop={8} style={styles.quickPill} onPress={() => setShowFaq(true)}>
                <HelpCircle color="#000000" size={16} />
                <Text style={styles.quickPillText}>FAQ</Text>
              </Pressable>
              <Pressable
                hitSlop={8}
                style={styles.quickPill}
                onPress={() => void Linking.openURL("https://www.facebook.com/Rapexmarketplaceph")}
              >
                <Link2 color="#000000" size={16} />
                <Text style={styles.quickPillText}>Facebook</Text>
              </Pressable>
              <Pressable hitSlop={8} style={styles.quickPill} onPress={() => setShowSupport(true)}>
                <MessageCircle color="#000000" size={16} />
                <Text style={styles.quickPillText}>Support</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.hero}>
          <View style={styles.heroOverlay}>
            <Image source={RAPEX_LOGO} style={styles.heroLogo} resizeMode="contain" />
            <Image source={RAPEX_WORDMARK} style={styles.heroWordmark} resizeMode="contain" />
            <Text style={styles.heroTagline}>
              DELIVERING THE FUTURE, <Text style={styles.heroTaglineAccent}>TODAY.</Text>
            </Text>

            <Text style={styles.heroHeadline}>
              GAWANG <Text style={styles.heroHeadlineAccent}>LOKAL</Text>
              {"\n"}
              PARA SA <Text style={styles.heroHeadlineAccent}>MASA</Text>
            </Text>
            <View style={styles.heroDivider} />
          </View>
        </View>

        <View style={styles.featureRow}>
  {FEATURES.map((feature) => (
    <Pressable
      key={feature.key}
      style={styles.featureButton}
      onPress={() => setActivePreview(feature.previews)}
    >
      {({ pressed }) => (
        <>
          <View
            style={[
              styles.featureHex,
              pressed && styles.featureHexPressed,
            ]}
          >
            {pressed ? (
              <LinearGradient
                colors={["rgba(139,92,246,0.35)", "rgba(249,115,22,0.58)", "rgba(139,92,246,0.49)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featurePressedGlow}
                pointerEvents="none"
              />
            ) : null}
            <Image
              source={feature.icon}
              style={styles.featureIcon}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.featureLabel}>
            {feature.label}
          </Text>
        </>
      )}
    </Pressable>
  ))}
</View>

        <View style={styles.ctaArea}>
          <DeliverySlider
            label="SWIPE TO BEGIN"
            onComplete={() => navigation.navigate("AgeGate")}
          />
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

      </View>

      <FeaturePreviewModal visible={activePreview !== null} images={activePreview ?? []} onClose={() => setActivePreview(null)} />

      <Modal visible={showFaq} transparent animationType="slide" onRequestClose={() => setShowFaq(false)}>
        <View style={styles.infoBackdrop}>
          <SafeAreaView style={styles.infoSafe}>
            <View style={styles.infoCard}>
              <Pressable style={styles.infoClose} onPress={() => setShowFaq(false)}>
                <Text style={styles.infoCloseText}>×</Text>
              </Pressable>
              <Text style={styles.infoTitle}>RAPEX FAQ</Text>
              {FAQ_ITEMS.map(([question, answer]) => (
                <View key={question} style={styles.faqItem}>
                  <Text style={styles.faqQuestion}>{question}</Text>
                  <Text style={styles.faqAnswer}>{answer}</Text>
                </View>
              ))}
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal visible={showSupport} transparent animationType="fade" onRequestClose={() => setShowSupport(false)}>
        <View style={styles.infoBackdrop}>
          <SafeAreaView style={styles.infoSafe}>
            <View style={styles.infoCard}>
              <Pressable style={styles.infoClose} onPress={() => setShowSupport(false)}>
                <Text style={styles.infoCloseText}>×</Text>
              </Pressable>
              <Text style={styles.infoTitle}>RAPEX Support</Text>
              <View style={styles.supportItem}>
                <Text style={styles.supportLabel}>REX Support</Text>
                <Text style={styles.supportText}>AI chat assistance</Text>
              </View>
              <View style={styles.supportItem}>
                <Text style={styles.supportLabel}>Chat Support</Text>
                <Text style={styles.supportText}>Real admin support</Text>
              </View>
              <View style={styles.supportItem}>
                <Text style={styles.supportLabel}>Messenger Chat</Text>
                <Text style={styles.supportText}>Offline chat</Text>
              </View>
              <Pressable style={styles.supportItem} onPress={() => void Linking.openURL("mailto:rapexofficial2025@gmail.com")}>
                <Text style={styles.supportLabel}>Email</Text>
                <Text style={styles.supportText}>rapexofficial2025@gmail.com</Text>
              </Pressable>
              <View style={styles.supportItem}>
                <Text style={styles.supportLabel}>Emergency Support</Text>
                <Text style={styles.supportText}>Redirect to real admin</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#000000" },
  content: { flex: 1, minHeight: 0 },
  headerSafe: { backgroundColor: "transparent" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
  },
  headerTitle: { color: "#000000", fontSize: 17, fontWeight: "700" },
  quickRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "rgba(245,255,255,0.15)",
  },
  quickGroup: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" },
  quickPill: { flexDirection: "row", alignItems: "center", gap: 5 },
  quickPillText: { color: "#000000", fontSize: 14, fontWeight: "600" },
  quickIconOnly: { padding: 4 },
  quickDividerTall: { width: 5, height: 21, backgroundColor: "rgba(255,255,255,0.25)", marginHorizontal: 4 },
  hero: { width: "100%", aspectRatio: 0.966, justifyContent: "flex-end" },
  heroOverlay: { position: "absolute", paddingHorizontal: 20, paddingBottom: 1 },
  heroLogo: { width: 280, height: 210,top:25, right: 80, transform: [{ rotate: "-3deg" }] },
  heroWordmark: { width: 380, height: 300, marginTop:-150, marginBottom:-15 },
  heroTagline: { color: "#000000", fontSize: 16, fontWeight: "800", letterSpacing: 2, 
    bottom:84,marginBottom:15,marginTop: -20, textAlign: "center", lineHeight: 18 },
  heroTaglineAccent: { color: "#FF5E3D" },
  heroHeadline: {
    color: "#000000",
    fontSize: 29,
    fontWeight: "900",
    top: -55,
    textAlign: "center",
    marginTop: -4,
    lineHeight: 32,
    letterSpacing: 1.5, 
  },
  heroHeadlineAccent: { color: "#FF5E3D" },
  heroDivider: { width: 100, height: 4,top: -45,left:145, borderRadius: 2, backgroundColor: "#F97316", marginBottom: 50},
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    top: -80,
    marginTop: 1,
    marginBottom: -15,
  },
  featureButton: { alignItems: "center", width: 66, marginHorizontal: -8 },
  featureHex: {
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
  },
  featureHexPressed: {
    transform: [{ scale: 0.90 }],
  },
  featurePressedGlow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 39,
    borderWidth: 0,
    borderColor: "rgba(889,115,22,0.5)",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.9,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 0 },
  },
  featureIcon: { width: 59, height: 59 },
  featureEmoji: { fontSize: 45 },
  featureLabel: {
    marginTop: 10,
    color: "#000000",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: -30,
  },
  ctaArea: { paddingHorizontal: 20, marginBottom: 65 },
  ctaCard: { marginTop: 5 },
  footerBox: {
    marginHorizontal: 15,
    borderWidth: 2.5,
    borderColor: "rgba(255, 225, 255, 0.30)",
    backgroundColor: "rgba(255, 255, 255, 0.50)",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    gap: 2,
  },
  footerText: { color: "#000000", fontSize: 14, },
  footerTagline: {
    textAlign: "center",
    color: "#000000",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2.5,
    marginTop: 29,
  },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  dotActive: { width: 20, backgroundColor: "#FFFFFF" },
  infoBackdrop: { flex: 1, backgroundColor: "rgba(4, 2, 12, 0.55)" },
  infoSafe: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  infoCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.24)",
    backgroundColor: "rgba(20, 12, 42, 0.96)",
    padding: 20,
    gap: 12,
  },
  infoClose: { alignSelf: "flex-end", width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  infoCloseText: { color: "#FFFFFF", fontSize: 26, lineHeight: 28 },
  infoTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", textAlign: "center" },
  faqItem: { gap: 3 },
  faqQuestion: { color: "#C4B5FD", fontSize: 13, fontWeight: "700" },
  faqAnswer: { color: "rgba(255,255,255,0.78)", fontSize: 12, lineHeight: 17 },
  supportItem: { borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", borderRadius: 14, padding: 12, gap: 2 },
  supportLabel: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  supportText: { color: "rgba(255,255,255,0.68)", fontSize: 12 },
});


