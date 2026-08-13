import { StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Lock } from "lucide-react-native";
import { RapexGlassCard } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "IpLockout">;

/**
 * Real backend-enforced state (see XanoAuthRepository.checkAge -- the
 * `/pre-auth/check-age` endpoint blocks the device/IP for 48 hours on an
 * underage attempt). There's no "developer reset" button here on purpose
 * -- unlike the Gemini reference build, this isn't a demo; the lockout is
 * real and can only be lifted by the backend's own 48h expiry.
 */
export function IpLockoutScreen({ navigation }: Props) {
  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={[styles.flex, styles.center]}>
        <RapexGlassCard style={styles.card}>
          <View style={styles.cardInner}>
            <View style={styles.iconBadge}>
              <Lock color="#FCA5A5" size={30} />
            </View>
            <Text style={styles.pill}>Device Suspended (48 Hours)</Text>
            <Text style={styles.title}>Registration Restricted</Text>
            <Text style={styles.subtitle}>
              Our system detected an underage attempt from this device. Access is restricted for 48 hours under
              Philippine security policy.
            </Text>
            <Text style={styles.backLink} onPress={() => navigation.replace("Welcome")}>
              Back to Home
            </Text>
          </View>
        </RapexGlassCard>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#130C24" },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  card: { width: "100%" },
  cardInner: { padding: 24, alignItems: "center", gap: 12 },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(244,63,94,0.15)",
    borderWidth: 1,
    borderColor: "rgba(244,63,94,0.4)",
  },
  pill: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FB7185",
    backgroundColor: "rgba(244,63,94,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    textTransform: "uppercase",
    overflow: "hidden",
  },
  title: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 18 },
  backLink: { marginTop: 8, color: "#C4B5FD", fontWeight: "700", fontSize: 12 },
});
