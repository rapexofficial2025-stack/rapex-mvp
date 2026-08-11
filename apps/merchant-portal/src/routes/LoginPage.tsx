import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { toErrorMessage } from "@rapex/api-client";
import { rapexHttpClient } from "../services/apiConfig";
import { webTokenStorage } from "../services/webTokenStorage";

const BACKGROUND = new URL("../../../../assets/brand/Background/merchant-login.png", import.meta.url).href;
const GOOGLE_ICON = new URL("../../../../assets/brand/icons/google-logo-icon.png", import.meta.url).href;

/**
 * IMPORTANT: merchant-login.png / merchant-login-reference.png are full mockup
 * screenshots, not plain scenery -- the glass card (rounded border, blur tint),
 * the vertical divider, and the entire right-panel marketing copy ("Grow Your
 * Business With RAPEX" + the 4 feature boxes) are already painted into the
 * image itself, identically in both references. Only the LEFT panel differs
 * between the two references (blank in merchant-login.png, the real form in
 * merchant-login-reference.png) -- confirmed by viewing both directly.
 *
 * An earlier version of this file rebuilt the glass card AND the right panel
 * as real components on top of this same background, which produced a visibly
 * duplicated "ghost" of that content (verified via a from-scratch isolated
 * HTML test with no React/JS at all -- the duplication reproduced from the
 * background image alone, proving it wasn't a CSS/backdrop-filter rendering
 * bug). Fixed by rendering ONLY the left panel's dynamic content here, sized
 * and positioned (in %, estimated from the two reference images -- not a
 * pixel measurement) to sit inside the card's real, already-drawn left region,
 * letting the baked-in card/divider/right-panel show through untouched.
 *
 * Log In and Register go straight to the real Xano `super_app` group. Google
 * is an honest dead-end (no OAuth Client ID configured yet); no Xano endpoint
 * exists for Facebook at all, so it's not shown (the reference itself only
 * has a Google button on this screen).
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"intro" | "form">("intro");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await rapexHttpClient.request<{ authToken?: string }>({
        path: "/login",
        method: "POST",
        body: { email, password },
      });
      if (result?.authToken) await webTokenStorage.setToken(result.authToken);
      navigate("/portal/store");
    } catch (err) {
      setError(toErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        {stage === "intro" ? (
          <button type="button" style={styles.introTrigger} onClick={() => setStage("form")}>
            <span style={styles.introTriggerLabel}>MERCHANT LOGIN</span>
            <span style={styles.introTriggerHint}>Tap to sign in {"›"}</span>
          </button>
        ) : (
          <div style={styles.formWrap}>
            <h1 style={styles.formTitle}>Merchant Login</h1>
            <p style={styles.formSubtitle}>Access your merchant dashboard</p>

            <form style={styles.form} onSubmit={handleLogin}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Username or Email</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>{"\u{1F464}"}</span>
                  <input
                    style={styles.input}
                    type="email"
                    autoCapitalize="none"
                    placeholder="Enter your username or email"
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
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div style={styles.rememberRow}>
                <label style={styles.rememberLabel}>
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  Remember me
                </label>
                <button
                  type="button"
                  style={styles.forgotLink}
                  onClick={() => setSocialNotice("Forgot password isn't set up yet -- contact support for now.")}
                >
                  Forgot password?
                </button>
              </div>

              {error ? <span style={styles.errorText}>{error}</span> : null}

              <button type="submit" disabled={loading} style={styles.primaryButton}>
                {loading ? "Signing in..." : `→ Sign In`}
              </button>
            </form>

            <div style={styles.dividerRow}>
              <div style={styles.dividerLine} />
              <span style={styles.dividerText}>Or continue with</span>
              <div style={styles.dividerLine} />
            </div>

            <button
              type="button"
              style={styles.socialButton}
              onClick={() => setSocialNotice("Google sign-in needs an OAuth Client ID that isn't configured yet.")}
            >
              <img src={GOOGLE_ICON} alt="Google" style={styles.socialIcon} />
              Google
            </button>
            {socialNotice ? <p style={styles.socialNotice}>{socialNotice}</p> : null}

            <button type="button" style={styles.registerLink} onClick={() => navigate("/xano-test")}>
              Don't have an account? <span style={styles.registerLinkAccent}>Sign up here</span>
            </button>
          </div>
        )}
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
    backgroundPosition: "center",
    fontFamily: "inherit",
  },
  // Estimated (not measured) percentage bounds of the card's real left panel
  // within the background image -- nudge these if it doesn't line up on a
  // real render.
  leftPanel: {
    position: "absolute",
    top: "8%",
    left: "11%",
    width: "36%",
    height: "82%",
    display: "flex",
  },
  introTrigger: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: "none",
    border: "none",
    cursor: "pointer",
  },
  introTriggerLabel: { color: "rgba(255,255,255,0.55)", fontSize: 13, fontWeight: 700, letterSpacing: 2 },
  introTriggerHint: { color: "rgba(255,255,255,0.35)", fontSize: 12 },
  formWrap: { flex: 1, display: "flex", flexDirection: "column", gap: 10, justifyContent: "center", overflow: "auto" },
  formTitle: { margin: 0, fontSize: 22, fontWeight: 700, color: "#FFFFFF" },
  formSubtitle: { margin: "0 0 6px", fontSize: 12, color: "rgba(255,255,255,0.6)" },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  field: { display: "flex", flexDirection: "column", gap: 4 },
  fieldLabel: { fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)" },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "9px 11px",
  },
  inputIcon: { fontSize: 13, opacity: 0.7 },
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
  rememberRow: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: -2 },
  rememberLabel: { display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.7)" },
  forgotLink: { background: "none", border: "none", color: "#F97316", fontSize: 11, cursor: "pointer", padding: 0 },
  errorText: { color: "#FCA5A5", fontSize: 11 },
  primaryButton: {
    marginTop: 2,
    borderRadius: 12,
    padding: "11px",
    border: "none",
    background: "linear-gradient(90deg, #F97316, #8B5CF6)",
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  dividerRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 10 },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.14)" },
  dividerText: { fontSize: 10, color: "rgba(255,255,255,0.5)" },
  socialButton: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "#FFFFFF",
    borderRadius: 10,
    padding: "9px",
    color: "#1F1F1F",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  socialIcon: { width: 15, height: 15 },
  socialNotice: { fontSize: 10, color: "rgba(255,255,255,0.65)", marginTop: 8, textAlign: "center" },
  registerLink: {
    marginTop: 10,
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.65)",
    fontSize: 11,
    cursor: "pointer",
    textAlign: "center",
  },
  registerLinkAccent: { color: "#F97316", fontWeight: 700 },
};
