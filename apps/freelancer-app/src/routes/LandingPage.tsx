import { Link } from "react-router-dom";
import { useTheme } from "@rapex/ui-web";
import { RoleIcon } from "../components/RoleIcon";
import { ROLE_ORDER, ROLES } from "../lib/roles";
import { isRoleRegistered, useFreelancers } from "../lib/store";

export function LandingPage() {
  const theme = useTheme();
  const freelancers = useFreelancers();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: theme.colors.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: theme.spacing["3xl"],
        gap: theme.spacing["3xl"],
        textAlign: "center",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: theme.typography.fontSize["3xl"],
            fontWeight: 700,
            color: theme.colors.textPrimary,
            margin: 0,
          }}
        >
          Freelancer Professional Service
        </h1>
        <p style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textSecondary, marginTop: theme.spacing.sm }}>
          Prototype -- pick a role to test registration and booking a service.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: theme.spacing["2xl"],
        }}
      >
        {ROLE_ORDER.map((role) => {
          const registered = isRoleRegistered(freelancers, role);
          return (
            <Link
              key={role}
              to={`/role/${role}`}
              style={{
                textDecoration: "none",
                width: 200,
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radius.xl,
                padding: theme.spacing["2xl"],
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: theme.spacing.md,
                boxShadow: theme.shadows.md.css,
              }}
            >
              <RoleIcon role={role} size={72} />
              <div style={{ fontSize: theme.typography.fontSize.lg, fontWeight: 700, color: theme.colors.textPrimary }}>
                {ROLES[role].label}
              </div>
              <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{ROLES[role].tagline}</div>
              <div style={{ fontSize: theme.typography.fontSize.xs, color: registered ? theme.colors.success : theme.colors.textDisabled }}>
                {registered ? "✓ freelancers registered" : "No freelancers yet"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
