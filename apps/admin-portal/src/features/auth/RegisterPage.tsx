import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@rapex/ui-web";
import { useAsyncAction, useRepositories } from "@rapex/api-client";

const BACKGROUND = new URL("../../../../../assets/brand/Background/admin-login.png", import.meta.url).href;

/**
 * Real RAPEX-internal account creation (email/password), distinct from
 * Google/Facebook -- calls the existing AuthRepository.register(), same
 * pattern as every other real form in this app. XanoAdminAuthRepository's
 * register() currently throws a clear, real error ("Admin accounts are
 * provisioned by other admins...") because no confirmed public
 * admin-signup Xano endpoint exists yet -- that's real, surfaced behavior,
 * not a fake success. Swap only the repository's register() implementation
 * once a confirmed endpoint contract exists; this screen doesn't need to
 * change.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const { auth } = useRepositories();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const register = useAsyncAction((input: { name: string; email: string; phone: string; password: string }) =>
    auth.register(input),
  );

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <div>
          <div style={styles.brand}>RAPEX</div>
          <div style={styles.subtitle}>Create Admin Account</div>
        </div>

        <div style={styles.field}>
          <label style={styles.fieldLabel}>Name</label>
          <input style={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.fieldLabel}>Email</label>
          <input
            style={styles.input}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.fieldLabel}>Phone</label>
          <input style={styles.input} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div style={styles.field}>
          <label style={styles.fieldLabel}>Password</label>
          <input
            style={styles.input}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {register.error ? <ErrorState description={register.error} /> : null}

        <button
          type="button"
          disabled={register.loading}
          style={styles.primaryButton}
          onClick={async () => {
            await register.execute({ name, email, phone, password });
            navigate("/admin/dashboard", { replace: true });
          }}
        >
          {register.loading ? "Creating..." : "Create Account"}
        </button>

        <button type="button" style={styles.backLink} onClick={() => navigate("/admin/login")}>
          Back to Sign In
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    backgroundImage: `url(${BACKGROUND})`,
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    backgroundColor: "#0B0713",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  panel: {
    position: "relative",
    width: "33%",
    minWidth: 280,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 24,
    borderRadius: 16,
    background: "rgba(11,7,19,0.72)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  brand: { fontSize: 18, fontWeight: 700, color: "#FFFFFF" },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" },
  input: {
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "9px 11px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    color: "#FFFFFF",
  },
  primaryButton: {
    marginTop: 2,
    borderRadius: 12,
    padding: "12px",
    border: "none",
    background: "linear-gradient(90deg, #F97316, #8B5CF6)",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    cursor: "pointer",
    textAlign: "center",
  },
};
