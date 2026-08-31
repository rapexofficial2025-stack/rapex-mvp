import { Link, Navigate, useParams } from "react-router-dom";
import { Badge, Button, GlassCard, useTheme } from "@rapex/ui-web";
import { AppHeader } from "../components/AppHeader";
import { RoleIcon } from "../components/RoleIcon";
import { isRoleKey, ROLE_ORDER, ROLES } from "../lib/roles";
import { useBookings, useFreelancers } from "../lib/store";

export function RoleScreen() {
  const { role } = useParams<{ role: string }>();
  const theme = useTheme();
  const freelancers = useFreelancers();
  const bookings = useBookings();

  if (!isRoleKey(role)) {
    return <Navigate to="/" replace />;
  }

  const config = ROLES[role];
  const otherRoles = ROLE_ORDER.filter((key) => key !== role);
  const roleFreelancers = freelancers.filter((f) => f.role === role);
  const roleBookings = bookings.filter((b) => b.bookedByRole === role || b.freelancerRole === role);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <AppHeader crumb={config.label} />

      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: `0 ${theme.spacing.xl}px ${theme.spacing["3xl"]}px`,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing["2xl"],
        }}
      >
        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.lg }}>
            <RoleIcon role={role} />
            <div>
              <h1 style={{ margin: 0, fontSize: theme.typography.fontSize["2xl"], color: theme.colors.textPrimary }}>
                {config.label} screen
              </h1>
              <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{config.tagline}</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: theme.spacing.md, marginTop: theme.spacing.xl, flexWrap: "wrap" }}>
            <Link to={`/role/${role}/register`}>
              <Button label="Register as Freelancer" variant="primary" />
            </Link>
            <Link to={`/role/${role}/find-service`}>
              <Button label="Find Service" variant="outline" />
            </Link>
          </div>
        </GlassCard>

        <div>
          <h2 style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>Switch role</h2>
          <div style={{ display: "flex", gap: theme.spacing.sm }}>
            {otherRoles.map((key) => (
              <Link
                key={key}
                to={`/role/${key}`}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.xs,
                  padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
                  borderRadius: theme.radius.full,
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.textPrimary,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                <RoleIcon role={key} size={20} />
                {ROLES[key].label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>
            {config.label} freelancers registered ({roleFreelancers.length})
          </h2>
          {roleFreelancers.length === 0 ? (
            <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
              None yet -- try "Register as Freelancer" above.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
              {roleFreelancers.map((freelancer) => (
                <GlassCard key={freelancer.id} style={{ padding: theme.spacing.md }}>
                  <div style={{ fontWeight: 600, color: theme.colors.textPrimary }}>{freelancer.name}</div>
                  <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{freelancer.category}</div>
                </GlassCard>
              ))}
            </div>
          )}
          <p style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textDisabled, marginTop: theme.spacing.sm }}>
            Freelancers registered from <em>any</em> role show up under "Find Service" for every role -- open{" "}
            <Link to={`/role/${role}/find-service`} style={{ color: theme.colors.brandPrimary }}>
              Find Service
            </Link>{" "}
            to see and book the full directory.
          </p>
        </div>

        {roleBookings.length > 0 ? (
          <div>
            <h2 style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>
              Bookings involving {config.label} ({roleBookings.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
              {roleBookings.map((booking) => (
                <GlassCard key={booking.id} style={{ padding: theme.spacing.md }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.colors.textPrimary }}>
                        {booking.customerName} → {booking.freelancerName}
                      </div>
                      <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{booking.note}</div>
                    </div>
                    <Badge label={booking.status} tone={booking.status === "confirmed" ? "success" : "warning"} />
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
