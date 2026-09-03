import { useTheme } from "@rapex/ui-web";

const INTEGRATIONS = ["Xano API", "Firebase", "Google Maps", "PayMongo", "Push notifications"];

/** Desktop layout rail only. Real integration health must come from Xano. */
export function OperationsRail() {
  const theme = useTheme();
  return (
    <aside className="rapex-operations-rail" style={{ width: 224, flexShrink: 0, borderLeft: `1px solid ${theme.colors.border}`, background: theme.colors.surface, padding: 16, display: "flex", flexDirection: "column", gap: 22 }}>
      <section>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: 0.8, color: theme.colors.textSecondary }}>SYSTEM READINESS</p>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          {INTEGRATIONS.map((name) => <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
            <span style={{ color: theme.colors.textPrimary }}>{name}</span><span style={{ color: theme.colors.textSecondary }}>Unverified</span>
          </div>)}
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 11, lineHeight: 1.45, color: theme.colors.textSecondary }}>Live health data needs the Admin Xano status endpoint.</p>
      </section>
      <section>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 800, letterSpacing: 0.8, color: theme.colors.textSecondary }}>ACTIVITY FEED</p>
        <div style={{ marginTop: 12, borderLeft: `2px solid ${theme.colors.border}`, paddingLeft: 10 }}>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: theme.colors.textSecondary }}>No live events yet. Activity will appear here once the audit-log endpoint is connected.</p>
        </div>
      </section>
    </aside>
  );
}
