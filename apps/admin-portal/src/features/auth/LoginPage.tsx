import { useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ErrorState, Input } from "@rapex/ui-web";
import { useAsyncAction, useRepositories } from "@rapex/api-client";

/**
 * IMPORTANT: admin-login.png is a full mockup screenshot, not plain scenery --
 * the glass card (rounded border, blur tint), the vertical divider, AND the
 * entire left column's "Welcome to the Admin Portal" heading + supporting
 * text are already painted into the image itself (confirmed by viewing the
 * file directly). Only the right column is actually blank in the real asset.
 *
 * An earlier version of this file rendered its own RapexGlassCard + duplicate
 * "Welcome to the Admin Portal" text on top of this same background, which
 * produced a visibly nested/duplicated glass card on a real device (reported
 * from an actual Windows 7 test) -- same class of bug as the one caught and
 * fixed in merchant-portal's LoginPage.tsx via a from-scratch isolated test.
 * Fixed the same way: render ONLY the right column's real, functional login
 * form, positioned (in %, estimated from the image -- not pixel-measured)
 * inside the background's real right-panel region. No second card, no
 * duplicate heading -- the baked-in artwork provides both.
 *
 * Admin is the internal command center: no Sign Up / Google / Facebook /
 * Forgot Password here. The real Xano email/password auth call (auth.login)
 * below is untouched.
 */
const BACKGROUND = new URL("../../../../../assets/brand/Background/admin-login.png", import.meta.url).href;

export function LoginPage() {
  const navigate = useNavigate();
  const { auth } = useRepositories();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));

  return (
    <div style={styles.page}>
      <div style={styles.rightPanel}>
        <div>
          <div style={styles.brand}>RAPEX</div>
          <div style={styles.subtitle}>Sign In to Command Center</div>
        </div>

        <Input
          label="Email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {login.error ? <ErrorState description={login.error} /> : null}

        <Button
          label="Sign In"
          loading={login.loading}
          onClick={async () => {
            await login.execute({ email, password });
            navigate("/admin/dashboard", { replace: true });
          }}
        />
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    position: "relative",
    minHeight: "100vh",
    backgroundImage: `url(${BACKGROUND})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    fontFamily: "inherit",
  },
  // Estimated (not measured) percentage bounds of the card's real right
  // column within the background image -- nudge these if it doesn't line up
  // on a real render.
  rightPanel: {
    position: "absolute",
    top: "11%",
    left: "53%",
    width: "33%",
    height: "78%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 14,
  },
  brand: { fontSize: 18, fontWeight: 700, color: "#FFFFFF" },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 },
};
