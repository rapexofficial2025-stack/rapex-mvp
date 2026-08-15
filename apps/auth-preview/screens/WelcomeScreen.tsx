import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../App";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

const BACKGROUND = require("../assets/backgrounds/login-dark-1.png");

/** Screen 1 -- purely visual, "Let's get Started" just navigates to AgeGate. */
export function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <ImageBackground source={BACKGROUND} style={styles.flex} resizeMode="cover">
        <SafeAreaView style={styles.flex} edges={["top", "bottom"]}>
          <View style={styles.ctaWrap}>
            <Pressable
              onPress={() => navigation.navigate("AgeGate")}
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
