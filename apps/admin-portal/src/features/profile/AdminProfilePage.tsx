import { useEffect, useState, type CSSProperties } from "react";
import { Badge, useTheme, useThemeMode } from "@rapex/ui-web";
import { useRepositories } from "@rapex/api-client";
import type { AuthUser } from "@rapex/api-client";
import { getAdminAttendanceSummary, type AdminAttendanceSummary } from "../../services/sessionAudit";

function formatDateTime(iso: string | null): string {
  if (!iso) return "No record yet";
  return new Date(iso).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
}

export function AdminProfilePage() {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const { auth } = useRepositories();
  const [user, setUser] = useState<AuthUser | null | "loading">("loading");
  const [attendance, setAttendance] = useState<AdminAttendanceSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    auth.getCurrentUser().then((result) => {
      if (!cancelled) setUser(result);
    });
    setAttendance(getAdminAttendanceSummary());
    return () => {
      cancelled = true;
    };
  }, [auth]);

  return (
    <section style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18, maxWidth: 880 }}>
      <header>
        <p style={{ ...styles.eyebrow, color: theme.colors.brandPrimary }}>ADMIN PROFILE</p>
        <h1 style={{ ...styles.title, color: theme.colors.textPrimary }}>My profile</h1>
        <p style={{ ...styles.subtitle, color: theme.colors.textSecondary }}>Your account, work presence, and settings.</p>
      </header>

      <div style={{ ...styles.card, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <h2 style={{ ...styles.cardTitle, color: theme.colors.textPrimary }}>Account</h2>
        {user === "loading" ? (
          <p style={{ color: theme.colors.textSecondary }}>Loading…</p>
        ) : user ? (
          <dl style={styles.detailList}>
            <dt style={{ color: theme.colors.textSecondary }}>Name</dt>
            <dd style={{ color: theme.colors.textPrimary }}>{user.name || "Not on file yet"}</dd>
            <dt style={{ color: theme.colors.textSecondary }}>Email</dt>
            <dd style={{ color: theme.colors.textPrimary }}>{user.email}</dd>
            <dt style={{ color: theme.colors.textSecondary }}>Role</dt>
            <dd style={{ color: theme.colors.textPrimary }}>{user.role}</dd>
            <dt style={{ color: theme.colors.textSecondary }}>RAPEX ID</dt>
            <dd style={{ color: theme.colors.textPrimary }}>{user.rapexId ?? "Not confirmed yet"}</dd>
          </dl>
        ) : (
          <p style={{ color: theme.colors.textSecondary }}>Not signed in.</p>
        )}
        <p style={{ ...styles.note, color: theme.colors.textSecondary }}>
          Name and RAPEX ID are only as complete as Xano's admin login response -- there is no confirmed Admin
          "/me" endpoint yet, so these reuse whatever was cached from a previous session for this email.
        </p>
      </div>

      <div style={{ ...styles.card, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <h2 style={{ ...styles.cardTitle, color: theme.colors.textPrimary }}>Work presence</h2>
        <dl style={styles.detailList}>
          <dt style={{ color: theme.colors.textSecondary }}>Days worked (this device)</dt>
          <dd style={{ color: theme.colors.textPrimary }}>{attendance?.daysWorked ?? 0}</dd>
          <dt style={{ color: theme.colors.textSecondary }}>Total sign-ins (this device)</dt>
          <dd style={{ color: theme.colors.textPrimary }}>{attendance?.totalLogins ?? 0}</dd>
          <dt style={{ color: theme.colors.textSecondary }}>Last sign-in</dt>
          <dd style={{ color: theme.colors.textPrimary }}>{formatDateTime(attendance?.lastLoginAt ?? null)}</dd>
        </dl>
        <p style={{ ...styles.note, color: theme.colors.textSecondary }}>
          Counted from sign-ins on this device/browser only. A full cross-device attendance record needs a
          confirmed Xano session-log endpoint.
        </p>
      </div>

      <div style={{ ...styles.card, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <div style={styles.cardHeaderRow}>
          <h2 style={{ ...styles.cardTitle, color: theme.colors.textPrimary }}>Incentive points</h2>
          <Badge label="Not confirmed" tone="warning" />
        </div>
        <p style={{ color: theme.colors.textSecondary }}>
          Xano's reported schema has a shared <code>points_balance</code> field, but no Admin-facing endpoint has
          been confirmed to read or award it yet.
        </p>
      </div>

      <div style={{ ...styles.card, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <div style={styles.cardHeaderRow}>
          <h2 style={{ ...styles.cardTitle, color: theme.colors.textPrimary }}>Reward wallet</h2>
          <Badge label="Not confirmed" tone="warning" />
        </div>
        <p style={{ color: theme.colors.textSecondary }}>
          A wallet relationship exists in the reported schema, but no confirmed reward-wallet contract exists for
          Admin accounts yet -- this stays honestly empty rather than showing an invented balance.
        </p>
      </div>

      <div style={{ ...styles.card, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <h2 style={{ ...styles.cardTitle, color: theme.colors.textPrimary }}>Settings</h2>
        <div style={styles.settingRow}>
          <div>
            <p style={{ margin: 0, color: theme.colors.textPrimary, fontWeight: 700 }}>Appearance</p>
            <p style={{ margin: "2px 0 0", color: theme.colors.textSecondary, fontSize: 12 }}>Switch between dark and light mode.</p>
          </div>
          <button type="button" style={{ ...styles.toggleButton, borderColor: theme.colors.border, color: theme.colors.textPrimary }} onClick={toggleMode}>
            {mode === "dark" ? "Switch to light" : "Switch to dark"}
          </button>
        </div>
        <div style={styles.settingRow}>
          <div>
            <p style={{ margin: 0, color: theme.colors.textPrimary, fontWeight: 700 }}>Session security</p>
            <p style={{ margin: "2px 0 0", color: theme.colors.textSecondary, fontSize: 12 }}>You'll be signed out automatically after 30 minutes of inactivity.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  eyebrow: { margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1 },
  title: { margin: "4px 0", fontSize: 28 },
  subtitle: { margin: 0, fontSize: 14 },
  card: { border: "1px solid", borderRadius: 14, padding: 20, display: "flex", flexDirection: "column", gap: 10 },
  cardHeaderRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  cardTitle: { margin: 0, fontSize: 16 },
  detailList: { margin: 0, display: "grid", gridTemplateColumns: "200px 1fr", gap: "10px 12px", fontSize: 13 },
  note: { margin: 0, fontSize: 12, lineHeight: 1.5 },
  settingRow: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,.08)" },
  toggleButton: { border: "1px solid", borderRadius: 8, padding: "8px 12px", background: "transparent", font: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer" },
};
