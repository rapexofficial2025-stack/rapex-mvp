import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@rapex/ui-web";
import { useAsyncAction, useRepositories } from "@rapex/api-client";

const BACKGROUND = new URL("../../../../../assets/brand/Background/admin-login.png", import.meta.url).href;
const LOGO = new URL("../../../../../assets/brand/Branding Logo (Available)/Logo.png", import.meta.url).href;
const NAME = new URL("../../../../../assets/brand/Branding Logo (Available)/Name.png", import.meta.url).href;
const GOOGLE_ICON = new URL("../../../../../assets/brand/icons/google-logo-icon.png", import.meta.url).href;

/**
 * admin-login.png is a full mockup screenshot -- the glass card, divider,
 * and left column's "Welcome to the Admin Portal" heading + supporting text
 * are already painted into the image (confirmed by viewing the file
 * directly). Only the real logo graphic (not baked into the art) and the
 * right column's login form are real components here.
 *
 * Google/Facebook sign-in needs provider configuration. Email/password goes
 * through the real, unchanged XanoAdminAuthRepository.login(). The visual
 * treatment is deliberately self-contained: it is an Admin Portal surface,
 * not a second auth system.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { auth } = useRepositories();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        <img src={LOGO} alt="" style={{ width: 48, height: "auto" }} />
        <img src={NAME} alt="RAPEX -- Delivering the Future, Today." style={{ width: 150, height: "auto", marginTop: 4 }} />
      </div>

      <div style={styles.rightPanel}>
        <div>
          <div style={styles.eyebrow}>RAPEX COMMAND CENTER</div>
          <div style={styles.title}>Admin Login</div>
          <div style={styles.subtitle}>Access your administration dashboard</div>
        </div>

        <div style={styles.field}>
          <label style={styles.fieldLabel}>Email or mobile number</label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>ID</span>
            <input
              style={styles.input}
              type="text"
              autoComplete="username"
              placeholder="Enter your email or mobile number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.fieldLabel}>Password</label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>PW</span>
            <input
              style={styles.input}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={styles.eyeToggle}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="button"
          style={styles.forgotLink}
          onClick={() => navigate("/admin/forgot-password")}
        >
          Forgot Password?
        </button>

        {login.error ? <ErrorState description={login.error} /> : null}

        <button
          type="button"
          disabled={login.loading}
          style={styles.primaryButton}
          onClick={async () => {
            try {
              await login.execute({ email, password });
              navigate("/admin/dashboard", { replace: true });
            } catch {
              // The Xano error is rendered above. Never open an admin portal
              // after a failed sign-in attempt.
            }
          }}
        >
          {login.loading ? "Signing in…" : "Sign In"}
        </button>

        <div style={styles.dividerRow}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>Or continue with</span>
          <div style={styles.dividerLine} />
        </div>

        <div style={styles.socialRow}>
          <button
            type="button"
            style={styles.socialButton}
            onClick={() => setNotice("Google sign-in needs an OAuth Client ID that isn't configured yet.")}
          >
            <img src={GOOGLE_ICON} alt="Google" style={styles.socialIcon} />
            Google
          </button>
        </div>
        {notice ? <p style={styles.notice}>{notice}</p> : null}

        <button type="button" style={styles.previewButton} onClick={() => navigate("/admin/preview/dashboard")}>
          Preview Admin UI — no sign-in
        </button>

        <p style={styles.invitationOnly}>Admin access is invitation-only. Contact an authorized RAPEX administrator if you need access.</p>
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
  },
  leftPanel: {
    position: "absolute",
    top: "16%",
    left: "14%",
    width: "32%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  rightPanel: {
    position: "absolute",
    top: "12%",
    left: "54%",
    width: "31%",
    minHeight: 520,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 14,
    padding: 34,
    borderRadius: 22,
    border: "1px solid rgba(232, 210, 255, 0.34)",
    background: "linear-gradient(135deg, rgba(24, 19, 52, 0.68), rgba(84, 49, 88, 0.34))",
    boxShadow: "inset 1px 1px 0 rgba(255,255,255,.18), 0 18px 48px rgba(3,1,15,.35), 0 0 28px rgba(157,92,255,.18)",
    backdropFilter: "blur(18px)",
  },
  eyebrow: { fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: "#d7bdff" },
  title: { fontSize: 30, fontWeight: 750, letterSpacing: -0.6, color: "#FFFFFF", marginTop: 6 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.075)",
    borderRadius: 12,
    padding: "12px 13px",
  },
  inputIcon: { fontSize: 10, letterSpacing: 0.5, fontWeight: 800, opacity: 0.72 },
  input: {
    border: "none",
    background: "none",
    outline: "none",
    fontFamily: "inherit",
    fontSize: 13,
    color: "#FFFFFF",
    flex: 1,
    minWidth: 0,
  },
  eyeToggle: { background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "#E7DAFF", opacity: 0.85, padding: 0 },
  forgotLink: {
    alignSelf: "flex-end",
    background: "none",
    border: "none",
    color: "#C4B5FD",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    marginTop: -4,
  },
  primaryButton: {
    marginTop: 2,
    borderRadius: 12,
    padding: "13px",
    border: "1px solid rgba(245, 216, 255, .38)",
    background: "linear-gradient(100deg, rgba(249,115,22,.94), rgba(213,65,162,.93), rgba(125,60,235,.96))",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(99,52,207,.28), inset 0 1px 0 rgba(255,255,255,.26)",
  },
  dividerRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.14)" },
  dividerText: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  socialRow: { display: "flex", gap: 10 },
  socialButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "11px",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  socialIcon: { width: 15, height: 15 },
  notice: { fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: -2, textAlign: "center" },
  previewButton: {
    border: "1px solid rgba(207,182,255,.36)",
    borderRadius: 10,
    background: "rgba(255,255,255,.06)",
    color: "#e4d7ff",
    padding: "10px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  invitationOnly: { margin: "4px 0 0", color: "rgba(255,255,255,.56)", fontSize: 11, lineHeight: 1.5, textAlign: "center" },
};
