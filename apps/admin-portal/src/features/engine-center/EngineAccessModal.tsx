import { useState } from "react";
import { Button, DataTable, type DataTableColumn, ErrorState, Input, Loading, Modal, useTheme } from "@rapex/ui-web";
import {
  useEngineAccessGrants,
  useGrantEngineAccessAction,
  useRevokeEngineAccessAction,
  type AdminAccessGrant,
} from "@rapex/api-client";
import { formatDateTime } from "@rapex/utils";

type EngineAccessModalProps = {
  onClose: () => void;
};

export function EngineAccessModal({ onClose }: EngineAccessModalProps) {
  const theme = useTheme();
  const { data: grants, loading, error, refetch } = useEngineAccessGrants();
  const grantAccess = useGrantEngineAccessAction();
  const revokeAccess = useRevokeEngineAccessAction();
  const [adminId, setAdminId] = useState("");
  const [email, setEmail] = useState("");

  const columns: DataTableColumn<AdminAccessGrant>[] = [
    { key: "adminId", header: "Admin ID", render: (g) => g.adminId },
    { key: "email", header: "Email", render: (g) => g.email },
    { key: "grantedBy", header: "Granted By", render: (g) => g.grantedBy },
    { key: "grantedAt", header: "Granted", render: (g) => formatDateTime(g.grantedAt) },
    {
      key: "actions",
      header: "",
      render: (g) => (
        <Button
          label="Revoke"
          size="sm"
          variant="danger"
          loading={revokeAccess.loading}
          onClick={async () => {
            await revokeAccess.execute(g.id);
            refetch();
          }}
        />
      ),
    },
  ];

  return (
    <Modal title="Manage Engine Center Access" onClose={onClose}>
      <span style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>
        Only Super Admin-appointed admin IDs or emails can access the Engine Center.
      </span>

      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <Input label="Admin ID" value={adminId} onChange={(e) => setAdminId(e.target.value)} />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button
          label="+ Grant"
          size="sm"
          loading={grantAccess.loading}
          disabled={!adminId || !email}
          onClick={async () => {
            await grantAccess.execute({ adminId, email });
            setAdminId("");
            setEmail("");
            refetch();
          }}
        />
      </div>
      {grantAccess.error ? <ErrorState description={grantAccess.error} /> : null}

      <div style={{ marginTop: theme.spacing.sm }}>
        {loading ? (
          <Loading label="Loading access list…" />
        ) : error ? (
          <ErrorState description={error} onRetry={refetch} />
        ) : (
          <DataTable columns={columns} rows={grants ?? []} rowKey={(g) => g.id} pageSize={5} emptyMessage="No admins have access yet" />
        )}
      </div>
    </Modal>
  );
}
