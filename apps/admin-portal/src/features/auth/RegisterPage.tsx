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
  const [confirmPassword, setConfirmPassword] = useState("");
  const register = useAsyncAction((input: { name: string; email: string; phone: string; password: string }) => {
    const [firstName, ...rest] = input.name.trim().split(" ");
    return auth.register({
      email: input.email,
      password: input.password,
      role: "admin",
      firstName: firstName ?? input.name,
      lastName: rest.join(" "),
      mobile: input.phone,
    });
  });
  const passwordStrength = password.length >= 12 && /[a-zA-Z]/.test(password) && /\d/.test(password) ? "Strong" : password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password) ? "Normal" : "Weak";
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <div>
          <div style={styles.eyebrow}>RAPEX COMMAND CENTER</div>
          <div style={styles.brand}>Create Admin Account</div>
          <div style={styles.subtitle}>Account creation needs an Admin provisioning endpoint before it can be used live.</div>
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
          <span style={styles.passwordHint}>Password strength: <strong>{passwordStrength}</strong> · use letters and numbers</span>
        </div>
        <div style={styles.field}>
          <label style={styles.fieldLabel}>Retype password</label>
          <input
            style={styles.input}
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {confirmPassword ? <span style={passwordsMatch ? styles.match : styles.noMatch}>{passwordsMatch ? "Passwords match" : "Passwords do not match"}</span> : null}
        </div>

        {register.error ? <ErrorState description={register.error} /> : null}

        <button
          type="button"
          disabled={register.loading}
          style={styles.primaryButton}
          onClick={async () => {
            if (!passwordsMatch) return;
            try {
              await register.execute({ name, email, phone, password });
              navigate("/admin/dashboard", { replace: true });
            } catch {
              // The repository exposes the real Xano provisioning blocker.
            }
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
    backgroundSize: "cover",
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
    width: "min(100%, 460px)",
    minWidth: 280,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 24,
    borderRadius: 22,
    background: "linear-gradient(135deg, rgba(24,19,52,.78), rgba(84,49,88,.44))",
    border: "1px solid rgba(232,210,255,.34)",
    boxShadow: "inset 1px 1px 0 rgba(255,255,255,.18), 0 18px 48px rgba(3,1,15,.35)",
    backdropFilter: "blur(18px)",
  },
  eyebrow: { fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: "#d7bdff" },
  brand: { fontSize: 26, fontWeight: 750, color: "#FFFFFF" },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" },
  input: {
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "12px 13px",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    color: "#FFFFFF",
  },
  primaryButton: {
    marginTop: 2,
    borderRadius: 12,
    padding: "12px",
    border: "1px solid rgba(245,216,255,.38)",
    background: "linear-gradient(100deg, #f97316, #d541a2, #7d3ceb)",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  passwordHint: { fontSize: 11, color: "rgba(255,255,255,.62)" },
  match: { fontSize: 11, color: "#75f5b1" },
  noMatch: { fontSize: 11, color: "#ffbcbb" },
  backLink: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    cursor: "pointer",
    textAlign: "center",
  },
};
