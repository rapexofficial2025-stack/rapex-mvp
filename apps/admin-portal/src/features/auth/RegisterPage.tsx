import { useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";

const LOGO = new URL("../../../../../assets/brand/Branding Logo (Available)/Logo.png", import.meta.url).href;
const INVITATION_STEPS = [{ label: "Account", step: 1 }, { label: "Verify & activate", step: 2 }] as const;

function strengthFor(password: string) {
  const score = [password.length >= 12, /[A-Z]/.test(password), /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  if (score >= 5) return "Strong";
  if (score >= 3) return "Normal";
  return "Weak";
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="admin-invite-field"><span>{label}</span>{children}</label>;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const pageRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const strength = strengthFor(password);
  const previewMode = token === "preview";

  function handlePointerMove(event: ReactPointerEvent<HTMLElement>) {
    const page = pageRef.current;
    if (!page) return;
    page.style.setProperty("--admin-invite-cursor-x", `${event.clientX}px`);
    page.style.setProperty("--admin-invite-cursor-y", `${event.clientY}px`);
    page.dataset.cursorActive = event.target instanceof Element && event.target.closest(".admin-invite-card") ? "false" : "true";
  }

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

  return (
    <main ref={pageRef} className="admin-invite-page" data-cursor-active="false" onPointerMove={handlePointerMove} onPointerLeave={() => { if (pageRef.current) pageRef.current.dataset.cursorActive = "false"; }}>
      <div className="admin-invite-page__mesh" aria-hidden="true" />
      <div className="admin-invite-page__glow is-purple" aria-hidden="true" />
      <div className="admin-invite-page__glow is-orange" aria-hidden="true" />
      <div className="admin-invite-cursor" aria-hidden="true"><img src={LOGO} alt="" /></div>

      <section className="admin-invite-card" aria-label="Invitation-only Admin account setup">
        <header className="admin-invite-card__header">
          <img className="admin-invite-card__logo" src={LOGO} alt="RAPEX" />
          <div><span className="admin-invite-eyebrow">RAPEX COMMAND CENTER · INTERNAL ACCESS</span><h1>Admin Invitation</h1><p>Admin accounts are never created through public registration. An authorized invitation and role assignment are required.</p></div>
        </header>

        <ol className="admin-invite-progress" aria-label="Admin invitation progress">
          {INVITATION_STEPS.map(({ label, step: itemStep }) => <li key={label} data-state={itemStep === step ? "current" : itemStep < step ? "complete" : "upcoming"}><span>{itemStep}</span><small>{label}</small></li>)}
        </ol>

        {previewMode ? <p className="admin-invite-notice"><strong>UI preview.</strong> No invitation, OTP, role, or account will be created.</p> : null}

        {step === 1 ? <form className="admin-invite-form" noValidate={previewMode} onSubmit={continueToVerification}>
          <div className="admin-invite-field-row"><Field label="First name"><input required autoComplete="given-name" /></Field><Field label="Last name"><input required autoComplete="family-name" /></Field></div>
          <div className="admin-invite-field-row"><Field label="Email"><input required type="email" autoComplete="email" /></Field><Field label="Mobile number"><input required type="tel" autoComplete="tel" /></Field></div>
          <Field label="Profile photo"><input className="admin-invite-file" required type="file" accept="image/*" /></Field>
          <div className="admin-invite-field-row"><Field label="Password"><input required type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></Field><Field label="Confirm password"><input required type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></Field></div>
          <p className="admin-invite-hint">Password strength: <strong>{strength}</strong> · Strong password required for live activation.</p>
          <button className="admin-invite-primary" type="submit">Continue to verification</button>
        </form> : <form className="admin-invite-form" onSubmit={submitVerification}>
          <div className="admin-invite-otp-grid">
            <section><span className="admin-invite-eyebrow">EMAIL VERIFICATION</span><Field label="Email OTP"><input className="admin-invite-otp" inputMode="numeric" maxLength={6} placeholder="000000" /></Field><button className="admin-invite-secondary" type="button" onClick={() => setNotice("Email OTP was not sent. The invitation-bound Admin email OTP endpoint is required.")}>Send Email OTP</button></section>
            <section><span className="admin-invite-eyebrow">MOBILE VERIFICATION</span><Field label="Mobile OTP"><input className="admin-invite-otp" inputMode="numeric" maxLength={6} placeholder="000000" /></Field><button className="admin-invite-secondary" type="button" onClick={() => setNotice("Mobile OTP was not sent. The invitation-bound Admin SMS OTP endpoint is required.")}>Send Mobile OTP</button></section>
          </div>
          <p className="admin-invite-hint">INVITED → ACCOUNT CREATED → EMAIL VERIFIED → MOBILE VERIFIED → ADMIN APPROVED → ACTIVE</p>
          <div className="admin-invite-actions"><button className="admin-invite-secondary" type="button" onClick={() => { setStep(1); setNotice(null); }}>Back</button><button className="admin-invite-primary" type="submit">Complete Admin Setup</button></div>
        </form>}

        {notice ? <p className="admin-invite-notice is-api-required" role="status"><strong>API required.</strong> {notice}</p> : null}
        <button type="button" className="admin-invite-login-link" onClick={() => navigate("/admin/login")}>Return to Admin Login</button>
      </section>
    </main>
  );
}
