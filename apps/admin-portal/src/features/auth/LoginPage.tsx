import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ErrorState, Input, RapexGlassCard } from "@rapex/ui-web";
import { useAsyncAction, useRepositories } from "@rapex/api-client";

/**
 * Reference is the "Welcome to the Admin Portal" glassmorphism generated
 * image -- not yet uploaded as a real file (checked assets/brand/Background/,
 * nothing named Admin-login.* exists). This builds the real described
 * structure (copy, one glass card, vertical divider, functional form) now
 * and reuses the existing real `login-dark.png` as an isolated TEMP
 * background, same pattern as customer-app/rider-app/merchant-portal's
 * login screens. Swap only the `BACKGROUND` constant below once the real
 * Admin-login.png lands -- nothing else here depends on its exact pixels.
 *
 * Admin is the internal command center: no Sign Up / Google / Facebook /
 * public registration on the right. The real Xano email/password auth call
 * (auth.login) below is untouched.
 *
 * The login badge (top of the left panel) uses the real uploaded brand
 * assets from assets/brand/Branding Logo (Available)/ -- LOGO (eagle glyph)
 * and NAME (RAPEX wordmark + tagline) are the same two layers composited
 * together in ICON, kept separate here so they can animate independently
 * (a short staggered fade/slide-in) instead of using the single flattened
 * ICON image.
 */
const BACKGROUND = new URL("../../../../../assets/brand/Background/login-dark.png", import.meta.url).href;
const LOGO = new URL("../../../../../assets/brand/Branding Logo (Available)/Logo.png", import.meta.url).href;
const NAME = new URL("../../../../../assets/brand/Branding Logo (Available)/Name.png", import.meta.url).href;

export function LoginPage() {
  const navigate = useNavigate();
  const { auth } = useRepositories();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        backgroundImage: `url(${BACKGROUND})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(6,4,12,0.55), rgba(6,4,12,0.75))",
        }}
      />

      <div className="relative w-full max-w-4xl">
        <RapexGlassCard style={{ padding: 0, overflow: "hidden" }}>
          <div className="flex flex-col md:flex-row">
            {/* Left panel: login badge (top, center) + intro copy -- no marketing links. */}
            <div
              className="flex flex-col items-center gap-4 p-8 md:w-1/2 md:p-12"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}
            >
              <div className="flex flex-col items-center" style={{ marginBottom: 4 }}>
                <img
                  src={LOGO}
                  alt=""
                  style={{ width: 56, height: "auto", animation: "rapex-fade-slide-in 500ms ease-out both" }}
                />
                <img
                  src={NAME}
                  alt="RAPEX -- Delivering the Future, Today."
                  style={{
                    width: 160,
                    height: "auto",
                    marginTop: 6,
                    animation: "rapex-fade-slide-in 500ms ease-out both",
                    animationDelay: "150ms",
                  }}
                />
              </div>

              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.25, textAlign: "center" }}>
                Welcome to the{" "}
                <span
                  style={{
                    background: "linear-gradient(90deg, #F97316, #8B5CF6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Admin Portal
                </span>
              </h1>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 340, textAlign: "center" }}>
                Manage your platform with powerful tools and comprehensive analytics.
              </p>
            </div>

            {/* Vertical divider -- horizontal on the stacked (mobile) layout instead. */}
            <div
              className="hidden md:block"
              style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.14)" }}
            />

            {/* Right panel: the real, functional login form. Unchanged auth logic. */}
            <div className="flex flex-col justify-center gap-4 p-8 md:w-1/2 md:p-12">
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#FFFFFF" }}>RAPEX</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
                  Sign In to Command Center
                </div>
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
        </RapexGlassCard>
      </div>
    </div>
  );
}
