import { useMemo, useState, type CSSProperties } from "react";
import { Badge, useTheme } from "@rapex/ui-web";

type UserRole = "Customer" | "Merchant" | "Rider" | "Service provider" | "Admin";
type AccountStatus = "Active" | "Pending review" | "Restricted";
type UserRecord = {
  id: string;
  name: string;
  contact: string;
  role: UserRole;
  status: AccountStatus;
  location: string;
  joined: string;
  review?: { orderReference: string; signal: string; remark: string };
};

// PLACEHOLDER DATA ONLY. Replace with /admin-master-data/users after its
// field-level response contract and access policy are confirmed in Xano.
const PLACEHOLDER_USERS: UserRecord[] = [
  { id: "USR-2026-101", name: "Maria Santos", contact: "maria@example.test · 0917•••4587", role: "Customer", status: "Active", location: "Imus, Cavite", joined: "2026-08-12" },
  { id: "USR-2026-102", name: "Juan Dela Cruz", contact: "juan@example.test · 0918•••5678", role: "Merchant", status: "Active", location: "Bacoor, Cavite", joined: "2026-08-14" },
  { id: "USR-2026-103", name: "Ana Reyes", contact: "ana@example.test · 0919•••6789", role: "Rider", status: "Pending review", location: "Dasmariñas, Cavite", joined: "2026-08-16", review: { orderReference: "ORD-EXAMPLE-104", signal: "Repeated cancelled requests", remark: "Placeholder review note. Confirm facts and provide an appeal path before any account action." } },
  { id: "USR-2026-104", name: "Pedro Garcia", contact: "pedro@example.test · 0920•••7890", role: "Customer", status: "Restricted", location: "General Trias, Cavite", joined: "2026-08-18", review: { orderReference: "ORD-EXAMPLE-109", signal: "Manual review requested", remark: "Placeholder review note. A server-side audit record is required for real actions." } },
];

export function UserManagementPage() {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"All" | UserRole>("All");
  const [selected, setSelected] = useState<UserRecord | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const users = useMemo(() => PLACEHOLDER_USERS.filter((user) => (role === "All" || user.role === role) && `${user.name} ${user.contact} ${user.id}`.toLowerCase().includes(search.toLowerCase())), [role, search]);

  return (
    <section style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
      <header style={styles.header}>
        <div><p style={{ ...styles.eyebrow, color: theme.colors.brandPrimary }}>ADMIN MASTER DATA</p><h1 style={{ ...styles.title, color: theme.colors.textPrimary }}>User Management</h1><p style={{ ...styles.subtitle, color: theme.colors.textSecondary }}>Search registered accounts and open a documented account-risk review.</p></div>
        <Badge label="Placeholder data — Xano endpoint required" tone="warning" />
      </header>

      <div style={{ ...styles.filters, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <input aria-label="Search users" style={{ ...styles.search, color: theme.colors.textPrimary, background: theme.colors.surfaceAlt, borderColor: theme.colors.border }} placeholder="Search name, email, phone, or user ID" value={search} onChange={(event) => setSearch(event.target.value)} />
        <label style={{ ...styles.selectLabel, color: theme.colors.textSecondary }}>Role <select value={role} onChange={(event) => setRole(event.target.value as "All" | UserRole)} style={{ ...styles.select, color: theme.colors.textPrimary, background: theme.colors.surfaceAlt, borderColor: theme.colors.border }}><option>All</option><option>Customer</option><option>Merchant</option><option>Rider</option><option>Service provider</option><option>Admin</option></select></label>
      </div>

      <div style={{ ...styles.tableCard, background: theme.colors.surface, borderColor: theme.colors.border }}>
        <div style={styles.tableHeader}><span>User</span><span>Role</span><span>Status</span><span>Location</span><span>Joined</span><span>Review</span></div>
        {users.map((user) => <div key={user.id} style={{ ...styles.row, borderColor: theme.colors.border }}>
          <div><strong style={{ color: theme.colors.textPrimary }}>{user.name}</strong><small style={{ color: theme.colors.textSecondary }}>{user.id} · {user.contact}</small></div>
          <span style={{ color: theme.colors.textPrimary }}>{user.role}</span>
          <span style={{ ...styles.statusText, color: user.status === "Active" ? "#45D890" : user.status === "Pending review" ? "#E8B449" : "#F36B75" }}>{user.status}</span>
          <span style={{ color: theme.colors.textSecondary }}>{user.location}</span><span style={{ color: theme.colors.textSecondary }}>{user.joined}</span>
          <button type="button" style={{ ...styles.reviewButton, color: theme.colors.brandPrimary, borderColor: theme.colors.border }} onClick={() => setSelected(user)}>Open review</button>
        </div>)}
        {users.length === 0 ? <p style={{ color: theme.colors.textSecondary }}>No matching placeholder accounts.</p> : null}
      </div>

      {selected ? <aside style={{ ...styles.drawer, background: theme.colors.surface, borderColor: theme.colors.border }} aria-label="Account risk review">
        <div style={styles.header}><div><p style={{ ...styles.eyebrow, color: theme.colors.brandPrimary }}>MANUAL REVIEW</p><h2 style={{ ...styles.drawerTitle, color: theme.colors.textPrimary }}>{selected.name}</h2></div><button type="button" style={{ ...styles.close, color: theme.colors.textPrimary, borderColor: theme.colors.border }} onClick={() => setSelected(null)}>Close review</button></div>
        <p style={{ ...styles.warning, color: theme.colors.textSecondary }}>Do not call an account a scammer based on an automated flag. Verify facts, document the decision, protect appeal rights, and use an audited Xano action.</p>
        <dl style={styles.detailList}><dt style={{ color: theme.colors.textSecondary }}>Account</dt><dd style={{ color: theme.colors.textPrimary }}>{selected.id} · {selected.role}</dd><dt style={{ color: theme.colors.textSecondary }}>Current transaction</dt><dd style={{ color: theme.colors.textPrimary }}>{selected.review?.orderReference ?? "No linked transaction"}</dd><dt style={{ color: theme.colors.textSecondary }}>Reason for review</dt><dd style={{ color: theme.colors.textPrimary }}>{selected.review?.signal ?? "No review signal"}</dd><dt style={{ color: theme.colors.textSecondary }}>Admin remark</dt><dd style={{ color: theme.colors.textPrimary }}>{selected.review?.remark ?? "No remark recorded"}</dd></dl>
        <button type="button" style={{ ...styles.primary, background: theme.colors.brandPrimary }} onClick={() => setActionNotice("An audited status-change endpoint and approved reviewer workflow are required. No account action has been made.")}>Request audited Xano action</button>
        {actionNotice ? <p role="status" style={{ ...styles.note, color: theme.colors.textSecondary }}>{actionNotice}</p> : null}
        <p style={{ ...styles.note, color: theme.colors.textSecondary }}>No account status is changed in this UI. Device MAC address, raw device fingerprint, and hidden tracking data are intentionally excluded.</p>
      </aside> : null}
    </section>
  );
}

const styles: Record<string, CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }, eyebrow: { margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1 }, title: { margin: "4px 0", fontSize: 28 }, subtitle: { margin: 0, fontSize: 14 }, filters: { display: "flex", gap: 12, padding: 14, border: "1px solid", borderRadius: 14, alignItems: "center", flexWrap: "wrap" }, search: { minWidth: 280, flex: 1, border: "1px solid", borderRadius: 9, padding: 11, font: "inherit", outline: "none" }, selectLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700 }, select: { border: "1px solid", borderRadius: 8, padding: 9, font: "inherit" }, tableCard: { border: "1px solid", borderRadius: 14, overflow: "hidden", boxShadow: "inset 0 1px 0 rgba(255,255,255,.05), 0 12px 34px rgba(0,0,0,.12)" }, tableHeader: { display: "grid", gridTemplateColumns: "2.2fr .9fr .9fr 1.1fr .8fr .9fr", gap: 12, padding: "12px 16px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", color: "#8d88a8" }, row: { display: "grid", gridTemplateColumns: "2.2fr .9fr .9fr 1.1fr .8fr .9fr", gap: 12, alignItems: "center", padding: "14px 16px", borderTop: "1px solid", fontSize: 13 }, statusText: { fontSize: 12, fontWeight: 800 }, reviewButton: { border: "1px solid", borderRadius: 8, padding: "8px 9px", background: "transparent", font: "inherit", fontWeight: 700, cursor: "pointer" }, drawer: { position: "fixed", zIndex: 20, top: 84, right: 24, width: "min(440px, calc(100vw - 48px))", border: "1px solid", borderRadius: 16, padding: 20, boxShadow: "0 20px 54px rgba(0,0,0,.34)", display: "flex", flexDirection: "column", gap: 14 }, drawerTitle: { margin: "4px 0 0", fontSize: 22 }, close: { border: "1px solid", borderRadius: 8, background: "transparent", padding: "8px 10px", font: "inherit", cursor: "pointer" }, warning: { margin: 0, lineHeight: 1.5, fontSize: 13 }, detailList: { margin: 0, display: "grid", gridTemplateColumns: "135px 1fr", gap: "10px 12px", fontSize: 13 }, primary: { border: 0, borderRadius: 9, padding: 12, color: "#fff", font: "inherit", fontWeight: 800, cursor: "pointer" }, note: { margin: 0, fontSize: 12, lineHeight: 1.45 },
};
