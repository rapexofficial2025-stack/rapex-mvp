import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncAction, useRepositories } from "@rapex/api-client";

const BACKGROUND = new URL("../../../../assets/brand/Background/merchant-login.png", import.meta.url).href;
const GOOGLE_ICON = new URL("../../../../assets/brand/icons/google-logo-icon.png", import.meta.url).href;
const LOGO = new URL("../../../../assets/brand/Branding Logo (Available)/Logo.png", import.meta.url).href;

/**
 * IMPORTANT: merchant-login.png is a full mockup screenshot, not plain
 * scenery -- the glass card (rounded border, blur tint), the vertical
 * divider, and the entire right-panel marketing copy ("Grow Your Business
 * With RAPEX" + the 4 feature boxes) are already painted into the image
 * itself. The right panel's hexagon icon is drawn empty (no logo inside) --
 * that's the one real gap, filled below with the real Logo.png.
 *
 * `backgroundSize: "contain"` (not "cover") keeps the whole image, and
 * therefore the card's real proportions, visible and undistorted regardless
 * of viewport aspect ratio -- "cover" was letting the card blow up past the
 * viewport edges on some window sizes (real Windows 10 test finding).
 *
 * Shows the real form directly -- no separate "tap to sign in" intro stage
 * (real testing feedback: unnecessary extra step).
 *
 * Log In uses the real, already-wired AuthRepository (auth.login()) instead
 * of a raw, unconfigured HTTP client -- the previous version called
 * `rapexHttpClient` directly, which has no configured base URL and threw
 * "Failed to construct 'URL': Invalid base URL" on every submit (real
 * Windows 10 test finding). `auth` (XanoAuthRepository, wired in
 * AppProviders.tsx) uses the correctly-configured rapexAuthHttpClient.
 * Google is an honest dead-end (no OAuth Client ID configured yet); no Xano
 * endpoint exists for Facebook at all, so it's not shown (the reference
 * itself only shows a Google button on this screen).
 *
 * Login is two-phase under the Master Authentication Suite (see
 * XanoAuthRepository): the password step only sends a 6-digit code to the
 * account's email, it doesn't return a session -- `stage` switches this
 * same screen to an inline code-entry step instead of adding a new route,
 * since this is a single-page login (no auth stack like the mobile apps).
 */
export function LoginPage() {
  const navigate = useNavigate();
  const { auth } = useRepositories();
  const [stage, setStage] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));
  const verify = useAsyncAction((otpCode: string) => auth.verifyOtp(otpCode));

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const result = await login.execute({ email, password });
    if (result.status === "otp_required") setStage("otp");
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    await verify.execute(code);
    navigate("/portal/store");
  }

  return (
    <div style={styles.page}>
      <img src={LOGO} alt="" style={styles.rightLogo} />

      <div style={styles.leftPanel}>
        <div style={styles.formWrap}>
          {stage === "credentials" ? (
            <>
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
                    onClick={async () => {
                      if (!email) {
                        setSocialNotice("Enter your email above first, then click Forgot password.");
                        return;
                      }
                      await auth.requestPasswordReset(email);
                      setSocialNotice("If that account exists, a password reset link has been sent to its email.");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                {login.error ? <span style={styles.errorText}>{login.error}</span> : null}

                <button type="submit" disabled={login.loading} style={styles.primaryButton}>
                  {login.loading ? "Signing in..." : `→ Sign In`}
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
            </>
          ) : (
            <>
              <h1 style={styles.formTitle}>Verify It's You</h1>
              <p style={styles.formSubtitle}>Enter the 6-digit code sent to {email}</p>

              <form style={styles.form} onSubmit={handleVerify}>
                <div style={styles.field}>
                  <label style={styles.fieldLabel}>6-digit code</label>
                  <div style={styles.inputWrap}>
                    <input
                      style={styles.input}
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                </div>

                {verify.error ? <span style={styles.errorText}>{verify.error}</span> : null}

                <button type="submit" disabled={verify.loading} style={styles.primaryButton}>
                  {verify.loading ? "Verifying..." : "Verify"}
                </button>
              </form>

              <button type="button" style={styles.registerLink} onClick={() => setStage("credentials")}>
                Back
              </button>
            </>
          )}
        </div>
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
    top: "8%",
    left: "11%",
    width: "36%",
    height: "82%",
    display: "flex",
  },
  rightLogo: {
    position: "absolute",
    top: "9.5%",
    left: "63.5%",
    width: "6%",
    height: "auto",
  },
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
