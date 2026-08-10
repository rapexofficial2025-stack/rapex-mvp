import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { RapexGlassCard, Button as RapexButton } from "@rapex/ui-web";
import { toErrorMessage } from "@rapex/api-client";
import { rapexHttpClient } from "../services/apiConfig";
import { webTokenStorage } from "../services/webTokenStorage";

const BACKGROUND = new URL("../../../../assets/brand/Background/login-dark.png", import.meta.url).href;
const LOGO = new URL("../../../../assets/brand/Branding Logo (Available)/Wordmark-logo-v3.png", import.meta.url).href;
const GOOGLE_ICON = new URL("../../../../assets/icons/Home Icon/google.png", import.meta.url).href;
const FACEBOOK_ICON = new URL("../../../../assets/icons/Home Icon/facebook.png", import.meta.url).href;

/**
 * Two-stage login flow, web-appropriate equivalent of the RN apps'
 * WelcomeScreen -> LoginScreen navigation: one route (`/login`), two panels
 * inside it, slid via CSS transform instead of a second route -- a login
 * screen has nothing meaningful to deep-link to mid-flow. Reference artwork
 * is `login-dark-1`/`login-dark-2` (not yet uploaded); both stages reuse the
 * existing real `login-dark.png` as an isolated TEMP placeholder background,
 * same as customer-app/rider-app's Welcome/Login screens.
 *
 * Log In and Register go straight to the real Xano `super_app` group
 * (confirmed POST /login, /auth/signup fields -- not guessed). Google and
 * Facebook are left as honest dead-ends with an inline explanation instead
 * of fake success: Google needs an OAuth Client ID that doesn't exist
 * anywhere in this repo yet, and Facebook has no Xano endpoint at all
 * (confirmed by searching every API group's live spec -- "facebook" doesn't
 * appear anywhere). Wiring either for real would mean guessing.
 */
export function LoginPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"intro" | "form">("intro");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      <div style={styles.overlay} />
      <div style={trackStyle(stage)}>
        {/* Stage 1 / Login1: single "Let's Get Started" CTA, rendered visible (not an
            invisible Hotspot) since there's no login-dark-1 button artwork under it yet. */}
        <div style={styles.panel}>
          <div style={styles.center}>
            <img src={LOGO} alt="RAPEX" style={styles.logo} />
            <RapexGlassCard style={{ width: "100%" }}>
              <p style={styles.introText}>
                Manage your store, orders, and payouts -- all in one portal.
              </p>
              <RapexButton label="Let's Get Started" onClick={() => setStage("form")} />
            </RapexGlassCard>
          </div>
        </div>

        {/* Stage 2 / Login2: the real login form. */}
        <div style={styles.panel}>
          <div style={styles.center}>
            <img src={LOGO} alt="RAPEX" style={styles.logo} />

            <div style={styles.card}>
              <h1 style={styles.title}>Welcome Back, Partner!</h1>
              <p style={styles.subtitle}>Log in to manage your RAPEX store</p>

              <form style={styles.form} onSubmit={handleLogin}>
                <div style={styles.field}>
                  <label style={styles.fieldLabel}>Email</label>
                  <input
                    style={styles.input}
                    type="email"
                    autoCapitalize="none"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.fieldLabel}>Password</label>
                  <input
                    style={styles.input}
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {error ? <span style={styles.errorText}>{error}</span> : null}

                <button type="submit" disabled={loading} style={styles.primaryButton}>
                  {loading ? "Logging in..." : "Log In"}
                </button>
              </form>

              <div style={styles.dividerRow}>
                <div style={styles.dividerLine} />
                <span style={styles.dividerText}>or continue with</span>
                <div style={styles.dividerLine} />
              </div>

              <div style={styles.socialRow}>
                <button
                  type="button"
                  style={styles.socialButton}
                  onClick={() => setSocialNotice("Google sign-in needs an OAuth Client ID that isn't configured yet.")}
                >
                  <img src={GOOGLE_ICON} alt="Google" style={styles.socialIcon} />
                  Google
                </button>
                <button
                  type="button"
                  style={styles.socialButton}
                  onClick={() => setSocialNotice("Facebook sign-in has no Xano endpoint yet -- checked every API group.")}
                >
                  <img src={FACEBOOK_ICON} alt="Facebook" style={styles.socialIcon} />
                  Facebook
                </button>
              </div>
              {socialNotice ? <p style={styles.socialNotice}>{socialNotice}</p> : null}

              <button type="button" style={styles.registerLink} onClick={() => navigate("/xano-test")}>
                Don't have an account? <span style={styles.registerLinkAccent}>Register</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function trackStyle(stage: "intro" | "form"): CSSProperties {
  return {
    position: "relative",
    display: "flex",
    width: "200%",
    minHeight: "100vh",
    transform: stage === "intro" ? "translateX(0%)" : "translateX(-50%)",
    transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
  };
}

const styles: Record<string, CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    backgroundImage: `url(${BACKGROUND})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflow: "hidden",
    fontFamily: "inherit",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.35))",
  },
  panel: {
    width: "50%",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  },
  center: {
    position: "relative",
    width: "100%",
    maxWidth: 420,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
  },
  logo: {
    width: "80%",
    height: "auto",
    display: "block",
  },
  introText: {
    margin: "0 0 16px",
    fontSize: 14,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 26,
    background: "linear-gradient(135deg, rgba(6,4,12,0.92), rgba(22,10,38,0.88))",
    backdropFilter: "blur(24px) saturate(150%)",
    WebkitBackdropFilter: "blur(24px) saturate(150%)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 24px 48px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.16)",
  },
  title: { margin: 0, fontSize: 20, fontWeight: 700, color: "#FFFFFF" },
  subtitle: { margin: "4px 0 18px", fontSize: 13, color: "rgba(255,255,255,0.65)" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  fieldLabel: { fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)" },
  input: {
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.07)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#FFFFFF",
    outline: "none",
    fontFamily: "inherit",
  },
  errorText: { color: "#FCA5A5", fontSize: 11 },
  primaryButton: {
    marginTop: 2,
    borderRadius: 12,
    padding: "12px",
    border: "none",
    background: "linear-gradient(90deg, #8B5CF6, #F97316)",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  },
  dividerRow: { display: "flex", alignItems: "center", gap: 8, marginTop: 16 },
  dividerLine: { flex: 1, height: 1, background: "rgba(255,255,255,0.14)" },
  dividerText: { fontSize: 11, color: "rgba(255,255,255,0.5)" },
  socialRow: { display: "flex", gap: 10, marginTop: 12 },
  socialButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 6,
    border: "1px solid rgba(255,255,255,0.16)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "10px",
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  socialIcon: { width: 15, height: 15 },
  socialNotice: { fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 10, textAlign: "center" },
  registerLink: {
    marginTop: 16,
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    cursor: "pointer",
    textAlign: "center",
  },
  registerLinkAccent: { color: "#C4B5FD", fontWeight: 700 },
};
