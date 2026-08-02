import { useState } from "react";
import { Badge, Button, EmptyState, ErrorState, GlassCard, Loading, useTheme } from "@rapex/ui-web";
import { useStoreExpansionRequests, type MerchantStore, type ExpansionRequestStatus } from "@rapex/api-client";
import { formatDateTime } from "@rapex/utils";
import { RequestExpansionModal } from "./RequestExpansionModal";

type StoreExpansionProps = {
  store: MerchantStore;
};

const STATUS_TONE: Record<ExpansionRequestStatus, "success" | "warning" | "error"> = {
  approved: "success",
  pending: "warning",
  rejected: "error",
};

export function StoreExpansion({ store }: StoreExpansionProps) {
  const theme = useTheme();
  const [showRequest, setShowRequest] = useState(false);
  const { data: requests, loading, error, refetch } = useStoreExpansionRequests(store.id);

  return (
    <GlassCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: theme.typography.fontSize.lg, color: theme.colors.textPrimary }}>Store Expansion</h3>
          <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
            Request a wider coverage radius or a new branch location.
          </span>
        </div>
        <Button label="+ Request Expansion" size="sm" onClick={() => setShowRequest(true)} />
      </div>

      <div style={{ marginTop: theme.spacing.md, display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
        {loading ? (
          <Loading label="Loading expansion requests…" />
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : !requests || requests.length === 0 ? (
          <EmptyState title="No expansion requests yet" description="Submit a request when you're ready to grow." />
        ) : (
          requests.map((r) => (
            <div
              key={r.id}
              style={{
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.md,
                padding: theme.spacing.md,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: theme.spacing.sm,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 600, color: theme.colors.textPrimary }}>
                  {r.type === "new-branch" ? "New Branch" : "Coverage Increase"}
                  {r.requestedCoverageRadiusKm ? ` — ${r.requestedCoverageRadiusKm} km` : ""}
                </span>
                {r.proposedAddress ? (
                  <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{r.proposedAddress}</span>
                ) : null}
                <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{r.note}</span>
                <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
                  Submitted {formatDateTime(r.submittedAt)}
                </span>
              </div>
              <Badge label={r.status} tone={STATUS_TONE[r.status]} />
            </div>
          ))
        )}
      </div>

      {showRequest ? (
        <RequestExpansionModal
          storeId={store.id}
          onClose={() => setShowRequest(false)}
          onCreated={() => {
            setShowRequest(false);
            refetch();
          }}
        />
      ) : null}
    </GlassCard>
  );
}
