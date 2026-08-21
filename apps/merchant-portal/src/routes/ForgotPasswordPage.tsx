import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import { MerchantAuthShell } from "./MerchantAuthShell";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { auth } = useRepositories();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const reset = useAsyncAction((identifier: string) => auth.requestPasswordReset(identifier));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      await reset.execute(email.trim());
      setSent(true);
    } catch {
      // The request error remains visible and no sent state is simulated.
    }
  }

  return (
    <MerchantAuthShell
      eyebrow="Account recovery"
      title={sent ? "Check your email" : "Reset your password"}
      description={sent ? "If the account exists, Xano has sent its password-reset email." : "Enter the email connected to your merchant account."}
    >
      {sent ? (
        <div className="merchant-auth-result" role="status">
          <p>The secure link controls the next step. This web app will not simulate an OTP or password change without the confirmed reset-completion endpoint.</p>
          <button className="merchant-primary-button" type="button" onClick={() => navigate("/login")}>Return to sign in</button>
        </div>
      ) : (
        <form className="merchant-auth-form" onSubmit={handleSubmit}>
          <label className="merchant-field"><span>Email</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          {reset.error ? <p className="merchant-form-message is-error" role="alert">{reset.error}</p> : null}
          <button className="merchant-primary-button" type="submit" disabled={reset.loading}>{reset.loading ? "Requesting…" : "Send reset link"}</button>
          <button className="merchant-text-button" type="button" onClick={() => navigate("/login")}>Back to sign in</button>
        </form>
      )}
    </MerchantAuthShell>
  );
}
