import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@rapex/ui-web";

/** Security keys are never validated, cached, compared, or persisted in the browser. */
export function SuperAdminAccessPage({ previewMode = false }: { previewMode?: boolean }) {
  const navigate = useNavigate();
  const [securityKey, setSecurityKey] = useState("");
  const [contractVisible, setContractVisible] = useState(false);

  function requestVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSecurityKey("");
    if (previewMode) {
      // Demo-only: simulates what a successful elevation hands off to,
      // using mock data. No real key is checked -- see SuperAdminModulePage's
      // own preview banner for the same disclosure.
      navigate("/admin/preview/super-admin/admins");
      return;
    }
    setContractVisible(true);
  }

  return <div className="ecosystem-page super-admin-page">
    <header className="ecosystem-page-header"><div><span className="ecosystem-eyebrow">SUPER ADMIN · SECURE ACCESS</span><h1>God Mode access</h1><p>Verify a privileged session before exposing platform-wide mutation tools. The security key must be checked by Xano, never by frontend code.</p></div><span className="super-admin-lock-state">{previewMode ? "PREVIEW MODE" : "GOD MODE INACTIVE"}</span></header>
    {previewMode ? <section className="ecosystem-contract-panel" role="status"><div><span>DEMO PREVIEW -- NOT REAL ACCESS</span><h2>This is a design preview, not a live elevated session</h2><p>Xano's step-up verification endpoint (POST /super-admin/access/verify) doesn't exist yet -- entering any value below will just show what the unlocked screens are designed to look like, using mock data. No real Admin role or permission exists on this path.</p></div></section> : null}
    <section className="super-admin-access-grid">
      <form className="super-admin-gate" onSubmit={requestVerification}>
        <span>STEP-UP AUTHENTICATION</span><h2>Enter Security Key</h2><p>The current Admin session, role, device policy, security key, expiry, and audit context must all be verified server-side.</p>
        <label>Security Key<input value={securityKey} onChange={(event) => setSecurityKey(event.target.value)} type="password" autoComplete="one-time-code" placeholder={previewMode ? "Any value -- preview only" : "Enter on a live secured session"} required /></label>
        <Button label={previewMode ? "Preview unlocked screens" : "Verify Super Admin access"} type="submit" />
        <small>No key is stored in localStorage, sessionStorage, source code, or browser cache.</small>
      </form>
      <section className="super-admin-policy"><span>ACCESS POLICY</span><h2>Session capability response</h2><dl><div><dt>Identity</dt><dd>Authenticated Admin user ID and server-confirmed role</dd></div><div><dt>Capability</dt><dd>SUPER_ADMIN_GOD_MODE with allowed modules and actions</dd></div><div><dt>Expiry</dt><dd>Short-lived elevation expiry and re-verification requirement</dd></div><div><dt>Audit</dt><dd>Access attempt, success/failure, device context, IP policy and audit ID</dd></div></dl></section>
    </section>
    {contractVisible ? <section className="ecosystem-contract-panel" role="status"><div><span>NO ACCESS GRANTED</span><h2>Super Admin verification contract required</h2><p>The UI stopped before authentication. No Admin role or permission was changed.</p></div><dl><div><dt>POST</dt><dd>/super-admin/access/verify</dd></div><div><dt>REQUEST</dt><dd>Security key through TLS plus current authenticated session</dd></div><div><dt>RESPONSE</dt><dd>Server-confirmed role, allowed actions, elevation token and expiry</dd></div><div><dt>REVOKE</dt><dd>Immediate revocation, timeout and complete audit history</dd></div></dl><button type="button" onClick={() => setContractVisible(false)}>Close requirement</button></section> : null}
  </div>;
}
