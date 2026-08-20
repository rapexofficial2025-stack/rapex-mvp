import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

const BACKGROUND = new URL("../../../../../assets/brand/Background/admin-login.png", import.meta.url).href;

/**
 * UI-only reset flow. There is no confirmed admin reset/OTP Xano contract
 * yet, so this must never claim that an email was sent or a password changed.
 */
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  return (
    <main style={styles.page}>
      <section style={styles.card} aria-labelledby="forgot-password-title">
        <p style={styles.eyebrow}>RAPEX COMMAND CENTER</p>
        <h1 id="forgot-password-title" style={styles.title}>Reset your password</h1>
        <p style={styles.copy}>Enter the email connected to your Admin account. Sending the reset email will be enabled after the Xano reset endpoint is connected.</p>
        <label style={styles.label} htmlFor="reset-email">Email address</label>
        <input id="reset-email" style={styles.input} type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
        <button type="button" style={styles.primary} onClick={() => setMessage(email ? "Reset email requires the Admin Xano reset/OTP endpoint. No email has been sent." : "Enter an email address first.")}>Send reset email</button>
        {message ? <p role="status" style={styles.message}>{message}</p> : null}
        <button type="button" style={styles.back} onClick={() => navigate("/admin/login")}>Back to Sign In</button>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: `linear-gradient(rgba(8,5,22,.54), rgba(8,5,22,.72)), url(${BACKGROUND}) center / cover`, color: "#fff" },
  card: { width: "min(100%, 470px)", display: "flex", flexDirection: "column", gap: 14, padding: 34, border: "1px solid rgba(232,210,255,.36)", borderRadius: 22, background: "rgba(26,19,54,.66)", boxShadow: "inset 1px 1px 0 rgba(255,255,255,.18), 0 20px 56px rgba(0,0,0,.32)", backdropFilter: "blur(18px)" },
  eyebrow: { margin: 0, color: "#d7bdff", fontSize: 11, fontWeight: 800, letterSpacing: 1.2 },
  title: { margin: 0, fontSize: 30, letterSpacing: -0.7 },
  copy: { margin: 0, color: "rgba(255,255,255,.72)", lineHeight: 1.55, fontSize: 14 },
  label: { fontSize: 13, fontWeight: 700, marginTop: 6 },
  input: { border: "1px solid rgba(255,255,255,.23)", borderRadius: 12, padding: "13px", background: "rgba(255,255,255,.08)", color: "#fff", font: "inherit", outline: "none" },
  primary: { border: "1px solid rgba(245,216,255,.4)", borderRadius: 12, padding: "13px", background: "linear-gradient(100deg, #f97316, #d541a2, #7d3ceb)", color: "#fff", font: "inherit", fontWeight: 800, cursor: "pointer", boxShadow: "inset 0 1px 0 rgba(255,255,255,.25)" },
  message: { margin: 0, color: "#ffe2ad", fontSize: 13, lineHeight: 1.45 },
  back: { border: 0, background: "transparent", color: "#dfc9ff", cursor: "pointer", font: "inherit", padding: 6 },
};
