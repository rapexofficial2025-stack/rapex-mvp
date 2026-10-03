import { useState, type CSSProperties, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Badge, Button, EmptyState, GlassCard, Input, useTheme } from "@rapex/ui-web";
import { AppHeader } from "../components/AppHeader";
import { RoleIcon } from "../components/RoleIcon";
import { isRoleKey, ROLE_ORDER, ROLES, type RoleKey } from "../lib/roles";
import { createBooking, setBookingStatus, useBookings, useFreelancers, type FreelancerProfile } from "../lib/store";

export function FindServicePage() {
  const { role } = useParams<{ role: string }>();
  const theme = useTheme();
  const navigate = useNavigate();
  const freelancers = useFreelancers();
  const bookings = useBookings();

  const [roleFilter, setRoleFilter] = useState<RoleKey | "all">("all");
  const [bookingFor, setBookingFor] = useState<FreelancerProfile | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");

  if (!isRoleKey(role)) {
    return <Navigate to="/" replace />;
  }

  const config = ROLES[role];
  const visibleFreelancers = roleFilter === "all" ? freelancers : freelancers.filter((f) => f.role === roleFilter);
  const myBookings = bookings.filter((b) => b.bookedByRole === role);

  function handleBookingSubmit(event: FormEvent) {
    event.preventDefault();
    if (!bookingFor || !isRoleKey(role)) return;

    createBooking({
      freelancerId: bookingFor.id,
      freelancerName: bookingFor.name,
      freelancerRole: bookingFor.role,
      bookedByRole: role,
      customerName: customerName.trim() || "Prototype tester",
      note: note.trim() || `Booked via ${config.label} screen`,
    });

    setBookingFor(null);
    setCustomerName("");
    setNote("");
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <AppHeader crumb={`${config.label} / Find Service`} />

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
        <div>
          <h1 style={{ margin: 0, fontSize: theme.typography.fontSize["2xl"], color: theme.colors.textPrimary }}>
            Find a service ({config.label} view)
          </h1>
          <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
            Browse every registered freelancer -- across Rider, Customer, and Merchant -- and book one.
          </p>
        </div>

        <div style={{ display: "flex", gap: theme.spacing.sm, flexWrap: "wrap" }}>
          <button
            onClick={() => setRoleFilter("all")}
            style={filterChipStyle(theme, roleFilter === "all")}
            type="button"
          >
            All roles
          </button>
          {ROLE_ORDER.map((key) => (
            <button key={key} onClick={() => setRoleFilter(key)} style={filterChipStyle(theme, roleFilter === key)} type="button">
              {ROLES[key].label}
            </button>
          ))}
        </div>

        {visibleFreelancers.length === 0 ? (
          <EmptyState
            title="No freelancers registered yet"
            description="Register one from any role screen and it will show up here for every role."
            actionLabel="Register as Freelancer"
            onAction={() => navigate(`/role/${role}/register`)}
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
            {visibleFreelancers.map((freelancer) => (
              <GlassCard key={freelancer.id}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: theme.spacing.md, flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.md }}>
                    <RoleIcon role={freelancer.role} size={40} />
                    <div>
                      <div style={{ fontWeight: 600, color: theme.colors.textPrimary }}>{freelancer.name}</div>
                      <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{freelancer.category}</div>
                      <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textDisabled }}>{freelancer.phone}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
                    <Badge label={ROLES[freelancer.role].label} tone="neutral" />
                    <Button label="Book this freelancer" size="sm" onClick={() => setBookingFor(freelancer)} />
                  </div>
                </div>

                {bookingFor?.id === freelancer.id ? (
                  <form
                    onSubmit={handleBookingSubmit}
                    style={{
                      marginTop: theme.spacing.lg,
                      paddingTop: theme.spacing.lg,
                      borderTop: `1px solid ${theme.colors.border}`,
                      display: "flex",
                      flexDirection: "column",
                      gap: theme.spacing.md,
                    }}
                  >
                    <Input label="Your name" placeholder="Prototype tester" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    <Input label="Note (optional)" placeholder="What do you need?" value={note} onChange={(e) => setNote(e.target.value)} />
                    <div style={{ display: "flex", gap: theme.spacing.sm }}>
                      <Button label="Confirm booking request" type="submit" size="sm" />
                      <Button label="Cancel" variant="secondary" size="sm" onClick={() => setBookingFor(null)} />
                    </div>
                  </form>
                ) : null}
              </GlassCard>
            ))}
          </div>
        )}

        <div>
          <h2 style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>
            Your bookings from the {config.label} screen ({myBookings.length})
          </h2>
          {myBookings.length === 0 ? (
            <p style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>No bookings yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
              {myBookings.map((booking) => (
                <GlassCard key={booking.id} style={{ padding: theme.spacing.md }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: theme.spacing.md, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: theme.colors.textPrimary }}>
                        {booking.customerName} → {booking.freelancerName} ({ROLES[booking.freelancerRole].label})
                      </div>
                      <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary }}>{booking.note}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
                      <Badge label={booking.status} tone={booking.status === "confirmed" ? "success" : "warning"} />
                      {booking.status === "pending" ? (
                        <Button label="Mark confirmed" size="sm" variant="outline" onClick={() => setBookingStatus(booking.id, "confirmed")} />
                      ) : null}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        <Link to={`/role/${role}`} style={{ color: theme.colors.brandPrimary, fontSize: theme.typography.fontSize.sm }}>
          ← Back to {config.label} screen
        </Link>
      </div>
    </div>
  );
}

function filterChipStyle(theme: ReturnType<typeof useTheme>, active: boolean): CSSProperties {
  return {
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    borderRadius: theme.radius.full,
    border: `1px solid ${active ? theme.colors.brandPrimary : theme.colors.border}`,
    backgroundColor: active ? theme.colors.brandPrimary : "transparent",
    color: active ? theme.colors.textInverse : theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 600,
    cursor: "pointer",
  };
}
