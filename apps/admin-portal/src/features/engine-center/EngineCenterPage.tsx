import { useState } from "react";
import { Badge, Button, ErrorState, Loading, useTheme } from "@rapex/ui-web";
import { useCurrentAdmin, type EngineKey } from "@rapex/api-client";
import { ENGINES } from "./engines";
import { EnginePanel } from "./EnginePanel";
import { EngineAccessModal } from "./EngineAccessModal";

export function EngineCenterPage() {
  const theme = useTheme();
  const { data: admin, loading, error, refetch } = useCurrentAdmin();
  const [activeEngine, setActiveEngine] = useState<EngineKey>("pricing");
  const [showAccess, setShowAccess] = useState(false);

  if (loading) return <Loading label="Loading Engine Center…" />;
  if (error) return <ErrorState description={error} onRetry={refetch} />;
  if (!admin) return null;

  const isSuperAdmin = admin.role === "super-admin";

  return (
    <div style={{ display: "flex", height: "calc(100vh - 65px)" }}>
      <div
        style={{
          width: 260,
          borderRight: `1px solid ${theme.colors.border}`,
          padding: theme.spacing.md,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.xs,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: theme.spacing.sm }}>
          <span style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textSecondary }}>Engines</span>
          <Badge label={isSuperAdmin ? "Super Admin" : "Admin"} tone={isSuperAdmin ? "accent" : "neutral"} />
        </div>
        <Badge label="Mock data — backend endpoint required" tone="warning" />
        <div style={{ height: theme.spacing.xs }} />
        {ENGINES.map((engine) => (
          <button
            key={engine.key}
            type="button"
            onClick={() => setActiveEngine(engine.key)}
            style={{
              textAlign: "left",
              border: `1px solid ${engine.key === activeEngine ? theme.colors.brandPrimary : "transparent"}`,
              borderRadius: theme.radius.md,
              padding: theme.spacing.sm,
              backgroundColor: engine.key === activeEngine ? theme.colors.surfaceAlt : "transparent",
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.sm,
            }}
          >
            <span style={{ fontSize: 16 }}>{engine.icon}</span>
            <span style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textPrimary }}>{engine.label}</span>
          </button>
        ))}

        {isSuperAdmin ? (
          <div style={{ marginTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.border}`, paddingTop: theme.spacing.md }}>
            <Button label="👤 Manage Admin Access" size="sm" variant="outline" onClick={() => setShowAccess(true)} />
          </div>
        ) : null}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: theme.spacing.lg }}>
        <EnginePanel key={activeEngine} engine={ENGINES.find((e) => e.key === activeEngine)!} />
      </div>

      {showAccess ? <EngineAccessModal onClose={() => setShowAccess(false)} /> : null}
    </div>
  );
}
