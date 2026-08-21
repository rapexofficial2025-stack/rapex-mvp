import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import type { GoogleProfileInput } from "@rapex/api-client";
import { MerchantAuthShell } from "./MerchantAuthShell";
import { signInWithGoogle } from "../services/socialAuth";

const GOOGLE_ICON = new URL("../../../../assets/brand/icons/google-logo-icon.png", import.meta.url).href;

export function LoginPage() {
  const navigate = useNavigate();
  const { auth } = useRepositories();
  const [stage, setStage] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));
  const verify = useAsyncAction((otpCode: string) => auth.verifyOtp(otpCode));
  const googleLogin = useAsyncAction((profile: GoogleProfileInput) => auth.loginWithGoogle(profile));

  async function handleGoogleSignIn() {
    setNotice(null);
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      const { uid, email, displayName } = result.user;
      if (!email) throw new Error("Google didn't share an email for this account -- try a different Google account.");
      const [firstName, ...rest] = (displayName ?? "").split(" ").filter(Boolean);
      const profile: GoogleProfileInput = { googleId: uid, email, firstName, lastName: rest.join(" ") || undefined };
      await googleLogin.execute(profile);
      navigate("/portal/dashboard");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Google sign-in failed.");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setNotice(null);
    try {
      const result = await login.execute({ email: email.trim(), password });
      if (result.status === "otp_required") setStage("otp");
      if (result.status === "authenticated") navigate("/portal/dashboard");
    } catch {
      // useAsyncAction exposes the real Xano error in the form.
    }
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setNotice("Enter the complete 6-digit verification code.");
      return;
    }
    try {
      await verify.execute(code);
      navigate("/portal/dashboard");
    } catch {
      // useAsyncAction exposes the real Xano error in the form.
    }
  }

  return (
    <MerchantAuthShell
      eyebrow="Merchant access"
      title={stage === "credentials" ? "Welcome back" : "Verify your sign-in"}
      description={stage === "credentials" ? "Sign in to continue to RAPEX Merchant OS." : "Enter the 6-digit code sent to " + email + "."}
    >
      {stage === "credentials" ? (
        <>
          <form className="merchant-auth-form" onSubmit={handleLogin}>
            <label className="merchant-field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                required
                placeholder="merchant@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="merchant-field">
              <span>Password</span>
              <input
                type="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <div className="merchant-auth-form__links">
              <span>Two-step verification is required.</span>
              <button type="button" onClick={() => navigate("/forgot-password")}>Forgot password?</button>
            </div>

            {login.error ? <p className="merchant-form-message is-error" role="alert">{login.error}</p> : null}
            {notice ? <p className="merchant-form-message" role="status">{notice}</p> : null}

            <button className="merchant-primary-button" type="submit" disabled={login.loading}>
              {login.loading ? "Checking credentials…" : "Sign in"}
            </button>
          </form>

          <div className="merchant-auth-divider"><span>or continue with</span></div>

          <button
            className="merchant-social-button"
            type="button"
            disabled={googleLoading}
            onClick={handleGoogleSignIn}
          >
            <img src={GOOGLE_ICON} alt="" />
            {googleLoading ? "Signing in…" : "Continue with Google"}
          </button>

          <p className="merchant-auth-switch">
            New to RAPEX? <button type="button" onClick={() => navigate("/register")}>Create merchant account</button>
          </p>

          <button className="merchant-text-button" type="button" onClick={() => navigate("/portal/preview/dashboard")}>
            Preview Merchant UI — no sign-in
          </button>
        </>
      ) : (
        <form className="merchant-auth-form" onSubmit={handleVerify}>
          <label className="merchant-field">
            <span>Verification code</span>
            <input
              className="merchant-field__otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              placeholder="000000"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            />
          </label>
          {verify.error ? <p className="merchant-form-message is-error" role="alert">{verify.error}</p> : null}
          {notice ? <p className="merchant-form-message" role="status">{notice}</p> : null}
          <button className="merchant-primary-button" type="submit" disabled={verify.loading}>
            {verify.loading ? "Verifying…" : "Verify and open dashboard"}
          </button>
          <button className="merchant-text-button" type="button" onClick={() => setStage("credentials")}>Back to sign in</button>
        </form>
      )}
    </MerchantAuthShell>
  );
}
