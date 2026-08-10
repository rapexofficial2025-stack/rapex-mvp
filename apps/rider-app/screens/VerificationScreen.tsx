import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View } from "react-native";
import { Badge, Button, EmptyState, ErrorState, Loading } from "@rapex/ui-native";
import { useRiderProfile } from "@rapex/api-client";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Verification">;

const REQUIRED_DOCUMENTS = ["driver-license", "valid-id", "selfie-with-id"] as const;

const STATUS_TONE = { pending: "warning", verified: "success", rejected: "error", suspended: "error" } as const;

export function VerificationScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { data: profile, loading, error, refetch } = useRiderProfile();

  if (loading) return <Loading />;
  if (error || !profile) return <ErrorState description={error ?? "Could not load verification status."} onRetry={refetch} />;

  return (
    <ScreenContainer title="Account Verification" subtitle="Admin approval is required before you can receive deliveries.">
      <View style={{ flexDirection: "row", alignItems: "center", gap: theme.spacing.sm }}>
        <Text style={{ color: theme.colors.textPrimary, fontSize: theme.typography.fontSize.base }}>Status:</Text>
        <Badge label={profile.verificationStatus.toUpperCase()} tone={STATUS_TONE[profile.verificationStatus]} />
      </View>

      <View style={{ gap: theme.spacing.xs, marginTop: theme.spacing.md }}>
        {REQUIRED_DOCUMENTS.map((docType) => {
          const uploaded = profile.documents.some((d) => d.type === docType);
          return (
            <View key={docType} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: theme.colors.textPrimary }}>{docType.replace(/-/g, " ")}</Text>
              <Badge label={uploaded ? "Uploaded" : "Missing"} tone={uploaded ? "success" : "warning"} />
            </View>
          );
        })}
      </View>

      {profile.verificationStatus === "verified" ? (
        <Button label="Continue to Dashboard" onPress={() => navigation.replace("MainTabs")} />
      ) : (
        <EmptyState
          title="Waiting for admin approval"
          description="You'll be notified as soon as your documents are reviewed."
        />
      )}
      <Button label="Refresh Status" variant="secondary" onPress={refetch} />
    </ScreenContainer>
  );
}
