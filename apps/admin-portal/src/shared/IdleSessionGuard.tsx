import { useCallback, type CSSProperties, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useRepositories } from "@rapex/api-client";
import { useIdleLogoutGuard } from "./useIdleLogoutGuard";
import { recordAdminLogout } from "../services/sessionAudit";

/**
 * Wraps authenticated Admin Portal routes only (never the /admin/preview
 * routes, which have no real session). On timeout this signs the admin out
 * for real via auth.logout() and records the logout as system-forced --
 * see services/sessionAudit.ts for why that stays a quiet local record
 * rather than something surfaced to the admin.
 */
export function IdleSessionGuard({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { auth } = useRepositories();

  const handleTimeout = useCallback(() => {
    recordAdminLogout("system_idle_timeout");
    auth.logout().finally(() => {
      navigate("/admin/login?idle=1", { replace: true });
    });
  }, [auth, navigate]);

  const { phase, countdown, confirmPresent } = useIdleLogoutGuard(handleTimeout);

  if (phase === "active") return <>{children}</>;

  return (
    <>
      {children}
      <div style={styles.overlay} role="alertdialog" aria-modal="true" aria-label="Session check">
        <div style={styles.card}>
          {phase === "countdown" ? <div style={styles.countdown}>{countdown}</div> : null}
          <h2 style={styles.title}>Are you still there?</h2>
          <p style={styles.body}>
            {phase === "countdown"
              ? "You'll be signed out automatically if there's no response."
              : "We haven't seen any activity for a while."}
          </p>
          <button type="button" style={styles.button} onClick={confirmPresent} autoFocus>
            Yes, I&rsquo;m here
          </button>
        </div>
      </div>
    </>
  );
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(8, 4, 18, 0.68)",
    backdropFilter: "blur(6px)",
  },
  card: {
    width: "min(360px, calc(100vw - 48px))",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    textAlign: "center",
    padding: "32px 28px",
    borderRadius: 20,
    border: "1px solid rgba(232, 210, 255, 0.34)",
    background: "linear-gradient(135deg, rgba(24, 19, 52, 0.96), rgba(84, 49, 88, 0.9))",
    boxShadow: "inset 1px 1px 0 rgba(255,255,255,.18), 0 24px 60px rgba(3,1,15,.5), 0 0 32px rgba(157,92,255,.24)",
  },
  countdown: {
    fontSize: 48,
    fontWeight: 800,
    color: "#FFFFFF",
    lineHeight: 1,
  },
  title: { margin: "4px 0 0", fontSize: 20, fontWeight: 750, color: "#FFFFFF" },
  body: { margin: 0, fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.5 },
  button: {
    marginTop: 10,
    width: "100%",
    borderRadius: 12,
    padding: "13px",
    border: "1px solid rgba(245, 216, 255, .38)",
    background: "linear-gradient(100deg, rgba(249,115,22,.94), rgba(213,65,162,.93), rgba(125,60,235,.96))",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(99,52,207,.28), inset 0 1px 0 rgba(255,255,255,.26)",
  },
};
