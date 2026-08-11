import { useState } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Hotspot } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";
import { CATEGORY_HOTSPOTS, TOP_ICON_HOTSPOTS, FloatingReferenceModal, type FloatingKey } from "../components/LoginReferenceOverlays";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

/**
 * LOGIN1 / Screen 1 of the two-stage login flow (see LoginScreen.tsx for Screen 2).
 * Same real background asset and Hotspot architecture as customer-app's
 * WelcomeScreen.tsx -- this branding artwork (login-dark-1.png) is shared
 * across RAPEX apps, not customer-specific. See
 * components/LoginReferenceOverlays.tsx for the hit-area position data.
 */
const BACKGROUND = require("../../../assets/brand/Background/login-dark-1.png");

export function WelcomeScreen({ navigation }: Props) {
  const [activeFloating, setActiveFloating] = useState<FloatingKey | null>(null);

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <ImageBackground source={BACKGROUND} style={styles.flex} resizeMode="cover">
        <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
          {TOP_ICON_HOTSPOTS.login1.map((h) => (
            <Hotspot key={h.key} {...h.rect} label={h.label} onPress={() => setActiveFloating(h.key)} />
          ))}
          {CATEGORY_HOTSPOTS.login1.map((h) => (
            <Hotspot key={h.key} {...h.rect} label={h.label} onPress={() => setActiveFloating(h.key)} />
          ))}

          <View style={styles.ctaWrap}>
            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={({ pressed }) => [styles.ctaPressable, { opacity: pressed ? 0.9 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel="Let's get Started"
            >
              <LinearGradient
                colors={["#F97316", "#EC4899", "#8B5CF6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaText}>Let's get Started</Text>
                <View style={styles.ctaChevronWrap}>
                  <Text style={styles.ctaChevron}>{">"}</Text>
                </View>
              </LinearGradient>
            </Pressable>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <FloatingReferenceModal activeKey={activeFloating} onClose={() => setActiveFloating(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  ctaWrap: {
    position: "absolute",
    top: "78%",
    left: "8%",
    width: "84%",
  },
  ctaPressable: {},
  ctaButton: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ctaText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  ctaChevronWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaChevron: { color: "#8B5CF6", fontSize: 13, fontWeight: "700" },
});
