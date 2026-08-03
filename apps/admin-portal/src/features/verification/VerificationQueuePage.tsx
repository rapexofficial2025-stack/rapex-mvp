import { useMemo, useState } from "react";
import { Badge, Button, DataTable, ErrorState, Loading, useTheme, type DataTableColumn } from "@rapex/ui-web";
import {
  useApproveApplicantAction,
  useRejectApplicantAction,
  useVerificationQueue,
  type VerificationApplicant,
  type VerificationApplicantRole,
} from "@rapex/api-client";

const ROLE_LABEL: Record<VerificationApplicantRole, string> = {
  merchant: "Merchant",
  rider: "Rider",
  "service-provider": "Service Provider",
};

const ROLE_TONE: Record<VerificationApplicantRole, "warning" | "success" | "info"> = {
  merchant: "warning",
  rider: "success",
  "service-provider": "info",
};

type RoleFilter = "all" | VerificationApplicantRole;

export function VerificationQueuePage() {
  const theme = useTheme();
  const { data: applicants, loading, error, refetch } = useVerificationQueue();
  const approve = useApproveApplicantAction();
  const reject = useRejectApplicantAction();
  const [filter, setFilter] = useState<RoleFilter>("all");

  const counts = useMemo(() => {
    const list = applicants ?? [];
    return {
      all: list.length,
      merchant: list.filter((a) => a.role === "merchant").length,
      rider: list.filter((a) => a.role === "rider").length,
      "service-provider": list.filter((a) => a.role === "service-provider").length,
    };
  }, [applicants]);

  const filtered = useMemo(() => {
    const list = applicants ?? [];
    return filter === "all" ? list : list.filter((a) => a.role === filter);
  }, [applicants, filter]);

  const columns: DataTableColumn<VerificationApplicant>[] = [
    { key: "name", header: "Applicant", render: (a) => a.name, sortValue: (a) => a.name },
    { key: "role", header: "Role", render: (a) => <Badge label={ROLE_LABEL[a.role]} tone={ROLE_TONE[a.role]} /> },
    { key: "submitted", header: "Submitted", render: (a) => new Date(a.submittedAt).toLocaleString(), sortValue: (a) => a.submittedAt },
    {
      key: "documents",
      header: "Documents",
      render: (a) => (
        <div style={{ display: "flex", gap: theme.spacing.xxs, flexWrap: "wrap" }}>
          {a.documentLabels.map((doc) => (
            <Badge key={doc} label={doc} tone="neutral" />
          ))}
        </div>
      ),
    },
    { key: "status", header: "Status", render: (a) => <Badge label={a.status} tone="warning" /> },
    {
      key: "actions",
      header: "Actions",
      render: (a) => (
        <div style={{ display: "flex", gap: theme.spacing.xs }}>
          <Button
            label="Approve"
            size="sm"
            loading={approve.loading}
            onClick={() => approve.execute(a.id).then(() => refetch())}
          />
          <Button
            label="Reject"
            size="sm"
            variant="danger"
            loading={reject.loading}
            onClick={() => reject.execute(a.id).then(() => refetch())}
          />
        </div>
      ),
    },
  ];

  if (loading) return <Loading />;
  if (error || !applicants) return <ErrorState description={error ?? "Could not load the verification queue."} onRetry={refetch} />;

  const TABS: { key: RoleFilter; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "merchant", label: `Merchants (${counts.merchant})` },
    { key: "rider", label: `Riders (${counts.rider})` },
    { key: "service-provider", label: `Service Providers (${counts["service-provider"]})` },
  ];

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
      <div>
        <h2 style={{ margin: 0, color: theme.colors.textPrimary }}>Verification Queue</h2>
        <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
          Review and approve pending user applications
        </p>
      </div>

      <div style={{ display: "flex", gap: theme.spacing.xs }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            style={{
              border: "none",
              borderRadius: theme.radius.full,
              padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
              backgroundColor: filter === tab.key ? theme.colors.brandPrimary : theme.colors.surfaceAlt,
              color: filter === tab.key ? theme.colors.textInverse : theme.colors.textPrimary,
              fontSize: theme.typography.fontSize.sm,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(a) => a.id}
        searchPlaceholder="Search applicants…"
        searchFn={(a, q) => a.name.toLowerCase().includes(q)}
        emptyMessage="No pending applications"
      />
    </div>
  );
}
