import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAsyncAction, useRepositories } from "@rapex/api-client";
import { MerchantAuthShell } from "./MerchantAuthShell";

type PasswordStrength = "Weak" | "Normal" | "Strong";

function getPasswordStrength(password: string): PasswordStrength {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  if (score >= 5) return "Strong";
  if (score >= 3) return "Normal";
  return "Weak";
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { auth } = useRepositories();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const register = useAsyncAction(() =>
    auth.register({
      email: email.trim(),
      password,
      role: "merchant",
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      mobile: mobile.trim(),
      addressLine1: address.trim() || undefined,
    }),
  );

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setFormError("Use at least 8 characters with both letters and numbers.");
      return;
    }
    try {
      await register.execute();
      setSubmitted(true);
    } catch {
      // Registration stays on the form and shows the real Xano error.
    }
  }

  return (
    <MerchantAuthShell
      eyebrow="Merchant registration"
      title={submitted ? "Application received" : "Create your account"}
      description={submitted ? "Your real registration was submitted for administrator verification." : "Create the owner account first. Store setup follows after approval."}
    >
      {submitted ? (
        <div className="merchant-auth-result" role="status">
          <span className="merchant-auth-result__status">Pending verification</span>
          <p>No automatic approval or fake session was created. RAPEX Admin must approve this merchant account before login.</p>
          <button className="merchant-primary-button" type="button" onClick={() => navigate("/login")}>Return to sign in</button>
        </div>
      ) : (
        <form className="merchant-auth-form" onSubmit={handleSubmit}>
          <div className="merchant-field-row">
            <label className="merchant-field"><span>First name</span><input required autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} /></label>
            <label className="merchant-field"><span>Last name</span><input required autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} /></label>
          </div>
          <label className="merchant-field"><span>Email</span><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label className="merchant-field"><span>Mobile number</span><input required type="tel" autoComplete="tel" value={mobile} onChange={(event) => setMobile(event.target.value)} /></label>
          <label className="merchant-field"><span>Address line <small>Optional until location IDs are available</small></span><input autoComplete="street-address" value={address} onChange={(event) => setAddress(event.target.value)} /></label>
          <div className="merchant-field-row">
            <label className="merchant-field"><span>Password</span><input required type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
            <label className="merchant-field"><span>Retype password</span><input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>
          </div>
          <div className="merchant-password-meter" data-strength={strength.toLowerCase()}><span>Password strength</span><strong>{strength}</strong></div>
          <p className="merchant-contract-note">Location selection IDs are not sent because the real region/province/municipality/barangay lookup contract is not yet available.</p>
          {formError ? <p className="merchant-form-message is-error" role="alert">{formError}</p> : null}
          {register.error ? <p className="merchant-form-message is-error" role="alert">{register.error}</p> : null}
          <button className="merchant-primary-button" type="submit" disabled={register.loading}>{register.loading ? "Submitting…" : "Create merchant account"}</button>
          <button className="merchant-text-button" type="button" onClick={() => navigate("/login")}>Back to sign in</button>
        </form>
      )}
    </MerchantAuthShell>
  );
}
