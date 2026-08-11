import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { ErrorState } from "@rapex/ui-web";
import { useAsyncAction, useRepositories } from "@rapex/api-client";

const BACKGROUND = new URL("../../../../../assets/brand/Background/admin-login.png", import.meta.url).href;
const LOGO = new URL("../../../../../assets/brand/Branding Logo (Available)/Logo.png", import.meta.url).href;
const NAME = new URL("../../../../../assets/brand/Branding Logo (Available)/Name.png", import.meta.url).href;
const GOOGLE_ICON = new URL("../../../../../assets/brand/icons/google-logo-icon.png", import.meta.url).href;
const FACEBOOK_ICON = new URL("../../../../../assets/brand/icons/facebook-logo-icon.png", import.meta.url).href;

/**
 * admin-login.png is a full mockup screenshot -- the glass card, divider,
 * and left column's "Welcome to the Admin Portal" heading + supporting text
 * are already painted into the image (confirmed by viewing the file
 * directly). Only the real logo graphic (not baked into the art) and the
 * right column's login form are real components here.
 *
 * Google/Facebook/Forgot Password were explicitly reversed from
 * internal-only to included (founder decision, confirmed after flagging
 * the conflict with the earlier "Admin is internal-only" rule). Same
 * honest disabled-with-toast pattern as every other app: neither has a
 * configured OAuth Client ID / Meta App ID yet, so pressing them explains
 * why instead of faking success. Forgot Password has no confirmed Xano
 * endpoint for admin (see XanoAdminAuthRepository's requestOtp), same
 * honest toast. Email/password goes through the real, unchanged
 * XanoAdminAuthRepository.login().
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
          <div style={styles.brand}>RAPEX</div>
          <div style={styles.subtitle}>Sign In to Command Center</div>
        </div>

        <div style={styles.field}>
          <label style={styles.fieldLabel}>Email</label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>{"✉️"}</span>
            <input
              style={styles.input}
              type="email"
              autoComplete="username"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.fieldLabel}>Password</label>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>{"\u{1F512}"}</span>
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
              {showPassword ? "\u{1F648}" : "\u{1F441}️"}
            </button>
          </div>
        </div>

        <button
          type="button"
          style={styles.forgotLink}
          onClick={() => setNotice("Forgot password isn't set up yet -- contact support for now.")}
        >
          Forgot Password?
        </button>

        {login.error ? <ErrorState description={login.error} /> : null}

        <button
          type="button"
          disabled={login.loading}
          style={styles.primaryButton}
          onClick={async () => {
            await login.execute({ email, password });
            navigate("/admin/dashboard", { replace: true });
          }}
        >
          {login.loading ? "Signing in..." : `→ Sign In`}
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
          <button
            type="button"
            style={styles.socialButton}
            onClick={() => setNotice("Facebook sign-in needs a Meta App ID that isn't configured yet.")}
          >
            <img src={FACEBOOK_ICON} alt="Facebook" style={styles.socialIcon} />
            Facebook
          </button>
        </div>
        {notice ? <p style={styles.notice}>{notice}</p> : null}

        <button type="button" style={styles.createAccountLink} onClick={() => navigate("/admin/register")}>
          Don't have an account? <span style={styles.createAccountAccent}>Create Account</span>
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
  },
  // Estimated (not measured) percentage bounds within the background image --
  // nudge these if they don't line up on a real render.
  leftPanel: {
    position: "absolute",
    top: "13%",
    left: "12%",
    width: "38%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  rightPanel: {
    position: "absolute",
    top: "11%",
    left: "53%",
    width: "33%",
    height: "78%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 12,
  },
  brand: { fontSize: 18, fontWeight: 700, color: "#FFFFFF" },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "9px 11px",
  },
  inputIcon: { fontSize: 13, opacity: 0.8 },
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
  eyeToggle: { background: "none", border: "none", cursor: "pointer", fontSize: 13, opacity: 0.7, padding: 0 },
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
    padding: "12px",
    border: "none",
    background: "linear-gradient(90deg, #F97316, #8B5CF6)",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
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
    padding: "9px",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  socialIcon: { width: 15, height: 15 },
  notice: { fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: -2, textAlign: "center" },
  createAccountLink: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    cursor: "pointer",
    textAlign: "center",
    marginTop: 4,
  },
  createAccountAccent: { color: "#C4B5FD", fontWeight: 700 },
};
