import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Pressable } from "react-native";
import { ShieldCheck } from "lucide-react-native";
import { RapexGlassCard } from "@rapex/ui-native";
import type { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "PendingApproval">;

/** Shown when real login is rejected because the account is still `pending_verification` (needs Admin approval) -- see LoginScreen's error-matching logic. */
export function PendingApprovalScreen({ navigation }: Props) {
  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={[styles.flex, styles.center]}>
        <RapexGlassCard style={styles.card}>
          <View style={styles.cardInner}>
            <View style={styles.iconBadge}>
              <ShieldCheck color="#FBBF24" size={30} />
            </View>
            <Text style={styles.pill}>Awaiting Admin Approval</Text>
            <Text style={styles.title}>Account Not Yet Active</Text>
            <Text style={styles.subtitle}>
              Your RAPEX account was created successfully, but it needs to be approved by an Admin before you can log
              in. This usually doesn't take long -- please check back soon.
            </Text>

            <Pressable
              onPress={() => navigation.replace("Login")}
              style={({ pressed }) => [styles.ctaWrap, { opacity: pressed ? 0.9 : 1 }]}
            >
              <LinearGradient
                colors={["#8B5CF6", "#6366F1", "#F97316"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaText}>Back to Log In</Text>
              </LinearGradient>
            </Pressable>
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
    backgroundColor: "rgba(251,191,36,0.15)",
    borderWidth: 1,
    borderColor: "rgba(251,191,36,0.4)",
  },
  pill: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#FBBF24",
    backgroundColor: "rgba(251,191,36,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    textTransform: "uppercase",
    overflow: "hidden",
  },
  title: { fontSize: 20, fontWeight: "800", color: "#FFFFFF" },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 18 },
  ctaWrap: { width: "100%", marginTop: 4 },
  ctaButton: { alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 18 },
  ctaText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
});
