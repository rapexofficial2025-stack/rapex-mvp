import { Pressable, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Plus, User } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { RapexGlassCard, EmptyState, ErrorState, Loading, Badge } from "@rapex/ui-native";
import { useChildAccounts } from "@rapex/api-client";
import type { RootStackParamList } from "../../types/navigation";
import { resetChildRegistrationDraft } from "../../services/childRegistrationStore";

type Props = NativeStackScreenProps<RootStackParamList, "ChildAccounts">;

/**
 * Entry point for the Child Accounts feature -- reached from Profile.
 * Header back-arrow returns to Profile (Standard screen); "Add Child"
 * starts the 4-step wizard (draft store persists across its own
 * back/forward navigation, reset only on successful submit or leaving here).
 */
export function ChildAccountsScreen({ navigation }: Props) {
  const { data: children, loading, error, refetch } = useChildAccounts();

  return (
    <View style={styles.flex}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Pressable
            onPress={() => {
              resetChildRegistrationDraft();
              navigation.navigate("ChildBasicInfo");
            }}
            style={({ pressed }) => [styles.addWrap, { opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient colors={["#F97316", "#EC4899", "#8B5CF6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addButton}>
              <Plus color="#FFFFFF" size={18} />
              <Text style={styles.addText}>Add Child</Text>
            </LinearGradient>
          </Pressable>

          {loading ? <Loading /> : null}
          {error ? <ErrorState description={error} onRetry={refetch} /> : null}
          {!loading && !error && (children?.length ?? 0) === 0 ? (
            <EmptyState title="No Child Accounts yet" description="Tap Add Child above to create one." />
          ) : null}

          {(children ?? []).map((child) => (
            <RapexGlassCard key={child.id} style={styles.childCard}>
              <View style={styles.childRow}>
                <View style={styles.avatarCircle}>
                  <User color="#FFFFFF" size={20} />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.childName}>{child.fullName}</Text>
                  <Text style={styles.childEmail}>{child.email}</Text>
                </View>
                <Badge label={child.status === "active" ? "Active" : "Inactive"} tone={child.status === "active" ? "success" : "neutral"} />
              </View>
            </RapexGlassCard>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#130C24" },
  flex1: { flex: 1 },
  scroll: { padding: 20, gap: 14 },
  addWrap: {},
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 18 },
  addText: { color: "#FFFFFF", fontWeight: "800", fontSize: 13 },
  childCard: { width: "100%" },
  childRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#8B5CF6", alignItems: "center", justifyContent: "center" },
  childName: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  childEmail: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
});
