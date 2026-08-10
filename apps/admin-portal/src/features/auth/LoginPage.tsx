import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ErrorState, Input, useTheme } from "@rapex/ui-web";
import { useAsyncAction, useRepositories } from "@rapex/api-client";

export function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { auth } = useRepositories();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useAsyncAction((input: { email: string; password: string }) => auth.login(input));

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.colors.background,
        padding: theme.spacing.xl,
      }}
    >
      <div
        style={{
          width: 400,
          maxWidth: "100%",
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.xl,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.md,
          boxShadow: theme.shadows.lg.css,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: theme.spacing.sm }}>
          <img
            src={`${import.meta.env.BASE_URL}brand/wordmark-logo-v3.png`}
            alt="RAPEX"
            style={{ width: "100%", maxWidth: 260, height: "auto", margin: "0 auto" }}
          />
          <div style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm, marginTop: theme.spacing.sm }}>
            Sign in to the Command Center
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
  );
}
