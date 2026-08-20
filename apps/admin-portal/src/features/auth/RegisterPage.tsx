import { useState, type CSSProperties, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";

const BACKGROUND = new URL("../../../../../assets/brand/Background/admin-login.png", import.meta.url).href;

function strengthFor(password: string) {
  const score = [password.length >= 12, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  if (score >= 5) return "Strong";
  if (score >= 3) return "Normal";
  return "Weak";
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const strength = strengthFor(password);
  const previewMode = token === "preview";

  function continueToVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    if (!previewMode && password !== confirmPassword) {
      setNotice("Passwords must match before the invitation can continue.");
      return;
    }
    setStep(2);
  }

  function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Activation stopped safely. Xano must validate the invitation token, verify Email and Mobile OTP, apply an authorized ADMIN role, create the Admin profile, and return INVITED or ADMIN_APPROVED with an audit ID. No Admin account was created.");
  }

  return <main style={{ ...styles.page, backgroundImage: `url(${BACKGROUND})` }}>
    <section style={styles.panel} aria-label="Invitation-only Admin account setup">
      <header><div style={styles.eyebrow}>RAPEX COMMAND CENTER · INTERNAL ACCESS</div><h1 style={styles.title}>Admin Invitation</h1><p style={styles.subtitle}>Admin accounts are never created through public registration. An authorized invitation and role assignment are required.</p></header>
      <div style={styles.stepRow}><span data-current={step === 1}>1 · Account</span><span data-current={step === 2}>2 · Verify</span></div>
      {previewMode ? <p style={styles.previewNotice}><strong>UI preview.</strong> No invitation, OTP, role, or account will be created.</p> : null}

      {step === 1 ? <form style={styles.form} noValidate={previewMode} onSubmit={continueToVerification}>
        <div style={styles.fieldRow}><label style={styles.field}>First name<input style={styles.input} required autoComplete="given-name" /></label><label style={styles.field}>Last name<input style={styles.input} required autoComplete="family-name" /></label></div>
        <div style={styles.fieldRow}><label style={styles.field}>Email<input style={styles.input} required type="email" autoComplete="email" /></label><label style={styles.field}>Mobile number<input style={styles.input} required type="tel" autoComplete="tel" /></label></div>
        <label style={styles.field}>Profile photo<input style={styles.fileInput} required type="file" accept="image/*" /></label>
        <div style={styles.fieldRow}><label style={styles.field}>Password<input style={styles.input} required type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label style={styles.field}>Confirm password<input style={styles.input} required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label></div>
        <p style={styles.hint}>Password strength: <strong>{strength}</strong> · Strong password required for live activation.</p>
        <button style={styles.primaryButton} type="submit">Continue to verification</button>
      </form> : <form style={styles.form} onSubmit={submitVerification}>
        <div style={styles.otpGrid}><section style={styles.otpCard}><span style={styles.eyebrow}>EMAIL VERIFICATION</span><label style={styles.field}>Email OTP<input style={styles.otpInput} inputMode="numeric" maxLength={6} placeholder="000000" /></label><button style={styles.secondaryButton} type="button" onClick={() => setNotice("Email OTP was not sent. The invitation-bound Admin email OTP endpoint is required.")}>Send Email OTP</button></section><section style={styles.otpCard}><span style={styles.eyebrow}>MOBILE VERIFICATION</span><label style={styles.field}>Mobile OTP<input style={styles.otpInput} inputMode="numeric" maxLength={6} placeholder="000000" /></label><button style={styles.secondaryButton} type="button" onClick={() => setNotice("Mobile OTP was not sent. The invitation-bound Admin SMS OTP endpoint is required.")}>Send Mobile OTP</button></section></div>
        <p style={styles.hint}>INVITED → ACCOUNT CREATED → EMAIL VERIFIED → MOBILE VERIFIED → ADMIN APPROVED → ACTIVE</p>
        <div style={styles.actions}><button style={styles.secondaryButton} type="button" onClick={() => { setStep(1); setNotice(null); }}>Back</button><button style={styles.primaryButton} type="submit">Complete Admin Setup</button></div>
      </form>}
      {notice ? <p style={styles.apiNotice} role="status"><strong>API required.</strong> {notice}</p> : null}
      <button type="button" style={styles.backLink} onClick={() => navigate("/admin/login")}>Return to Admin Login</button>
    </section>
  </main>;
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", padding: 24, display: "grid", placeItems: "center", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#0b0713" },
  panel: { width: "min(680px, 100%)", padding: 30, display: "grid", gap: 18, border: "1px solid rgba(232,210,255,.34)", borderRadius: 24, color: "#fff", background: "linear-gradient(135deg, rgba(24,19,52,.82), rgba(84,49,88,.48))", boxShadow: "0 24px 58px rgba(3,1,15,.4), inset 0 1px 0 rgba(255,255,255,.18)", backdropFilter: "blur(18px)" },
  eyebrow: { color: "#d7bdff", fontSize: 10, fontWeight: 800, letterSpacing: 1.2 },
  title: { margin: "7px 0 5px", fontSize: 30 },
  subtitle: { margin: 0, color: "rgba(255,255,255,.66)", fontSize: 13, lineHeight: 1.55 },
  stepRow: { display: "flex", gap: 8, color: "#d7bdff", fontSize: 11, fontWeight: 700 },
  previewNotice: { margin: 0, padding: 10, borderLeft: "2px solid #d7bdff", color: "rgba(255,255,255,.7)", background: "rgba(215,189,255,.07)", fontSize: 11 },
  form: { display: "grid", gap: 13 },
  fieldRow: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
  field: { display: "grid", gap: 6, color: "rgba(255,255,255,.82)", fontSize: 11, fontWeight: 650 },
  input: { minWidth: 0, padding: "11px 12px", border: "1px solid rgba(255,255,255,.2)", borderRadius: 11, outline: "none", color: "#fff", background: "rgba(255,255,255,.07)" },
  fileInput: { padding: 10, border: "1px solid rgba(255,255,255,.2)", borderRadius: 11, color: "rgba(255,255,255,.65)", background: "rgba(255,255,255,.07)" },
  hint: { margin: 0, color: "rgba(255,255,255,.58)", fontSize: 10, lineHeight: 1.5 },
  otpGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 },
  otpCard: { padding: 16, display: "grid", gap: 12, border: "1px solid rgba(255,255,255,.17)", borderRadius: 14, background: "rgba(255,255,255,.045)" },
  otpInput: { padding: 12, border: "1px solid rgba(255,255,255,.2)", borderRadius: 10, color: "#fff", background: "rgba(255,255,255,.07)", textAlign: "center", letterSpacing: ".35em", fontSize: 18 },
  actions: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  primaryButton: { padding: 12, border: "1px solid rgba(215,189,255,.5)", borderRadius: 11, color: "#fff", background: "linear-gradient(145deg, rgba(139,92,246,.62), rgba(35,28,55,.94))", cursor: "pointer", fontWeight: 720 },
  secondaryButton: { padding: 11, border: "1px solid rgba(255,255,255,.2)", borderRadius: 11, color: "#fff", background: "rgba(255,255,255,.055)", cursor: "pointer" },
  apiNotice: { margin: 0, padding: 11, border: "1px solid rgba(255,179,107,.28)", borderRadius: 9, color: "rgba(255,223,191,.86)", background: "rgba(255,136,62,.07)", fontSize: 11, lineHeight: 1.55 },
  backLink: { border: 0, color: "rgba(255,255,255,.6)", background: "none", cursor: "pointer" },
};
