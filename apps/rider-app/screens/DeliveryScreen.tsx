import { useState } from "react";
import { Linking, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Badge, Button, EmptyState, ErrorState, GlassCard, Input, Loading } from "@rapex/ui-native";
import { useActiveDelivery, useAsyncAction, useRepositories } from "@rapex/api-client";
import type { DeliveryOrderStatus } from "@rapex/api-client";
import { formatPeso } from "@rapex/utils";
import type { RootStackParamList } from "../types/navigation";
import { ScreenContainer } from "../components/ScreenContainer";
import { useAppTheme } from "../hooks/useAppTheme";

type Props = NativeStackScreenProps<RootStackParamList, "Delivery">;

const NEXT_ACTION: Partial<Record<DeliveryOrderStatus, { label: string; next: DeliveryOrderStatus }>> = {
  accepted: { label: "Heading to Merchant", next: "going-to-merchant" },
  "going-to-merchant": { label: "Arrived at Merchant", next: "arrived-merchant" },
  "arrived-merchant": { label: "Picked Up Package", next: "picked-up" },
  "picked-up": { label: "On the Way to Customer", next: "on-the-way" },
  "on-the-way": { label: "Arrived at Customer", next: "arrived-customer" },
};

export function DeliveryScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const { delivery } = useRepositories();
  const { data: active, loading, error, refetch } = useActiveDelivery();
  const [signature, setSignature] = useState("");
  const advance = useAsyncAction((status: DeliveryOrderStatus) => delivery!.advanceStatus(active!.orderId, status));
  const submitProof = useAsyncAction(() =>
    delivery!.submitProof({
      orderId: active!.orderId,
      packagePhotoLabel: "proof-package-1",
      customerPhotoLabel: null,
      signatureDataUrl: signature || "signature-captured",
      latitude: active!.customerLatitude,
      longitude: active!.customerLongitude,
      capturedAt: new Date().toISOString(),
    }),
  );
  const complete = useAsyncAction(() => delivery!.advanceStatus(active!.orderId, "completed"));
  const fail = useAsyncAction((note: string) => delivery!.advanceStatus(active!.orderId, "failed-delivery", note));

  if (loading) return <Loading />;
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (!active) return <EmptyState title="No active delivery" description="Accept a delivery request to get started." actionLabel="Back to Home" onAction={() => navigation.navigate("MainTabs")} />;

  const action = NEXT_ACTION[active.status];

  return (
    <ScreenContainer title="Active Delivery" subtitle={`Order #${active.orderId} · ${formatPeso(active.deliveryFee)}`}>
      <GlassCard>
        <Badge label={active.status.replace(/-/g, " ").toUpperCase()} tone="brand" />
        <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", marginTop: theme.spacing.sm }}>Merchant</Text>
        <Text style={{ color: theme.colors.textPrimary }}>{active.merchantName}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>{active.merchantAddress}</Text>

        <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", marginTop: theme.spacing.sm }}>Customer</Text>
        <Text style={{ color: theme.colors.textPrimary }}>{active.customerName}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>{active.customerAddress}</Text>
        <Button label={`Call ${active.customerPhone}`} variant="secondary" onPress={() => Linking.openURL(`tel:${active.customerPhone}`)} />
      </GlassCard>

      {error ? null : advance.error ? <ErrorState description={advance.error} /> : null}

      {action ? (
        <Button
          label={action.label}
          loading={advance.loading}
          onPress={async () => {
            await advance.execute(action.next);
            refetch();
          }}
        />
      ) : null}

      {active.status === "arrived-customer" ? (
        <GlassCard>
          <Text style={{ color: theme.colors.textPrimary, fontWeight: "700", marginBottom: theme.spacing.sm }}>
            Proof of Delivery
          </Text>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }}>
            Package photo + GPS coordinates are captured automatically. Add a signature below.
          </Text>
          <Input label="Customer Signature (type name to confirm)" value={signature} onChangeText={setSignature} />
          {submitProof.error ? <ErrorState description={submitProof.error} /> : null}
          <Button
            label="Submit Proof of Delivery"
            loading={submitProof.loading}
            disabled={!signature}
            onPress={async () => {
              await submitProof.execute();
              refetch();
            }}
          />
        </GlassCard>
      ) : null}

      {active.status === "delivered" ? (
        <Button
          label="Mark Completed"
          loading={complete.loading}
          onPress={async () => {
            await complete.execute();
            navigation.navigate("MainTabs");
          }}
        />
      ) : null}

      {active.status !== "delivered" && active.status !== "completed" ? (
        <Button
          label="Report Failed Delivery"
          variant="danger"
          loading={fail.loading}
          onPress={async () => {
            await fail.execute("Customer unreachable.");
            navigation.navigate("MainTabs");
          }}
        />
      ) : null}
    </ScreenContainer>
  );
}
