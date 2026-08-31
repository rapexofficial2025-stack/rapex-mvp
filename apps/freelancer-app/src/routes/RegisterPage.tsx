import { useState, type FormEvent } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button, GlassCard, Input, useTheme } from "@rapex/ui-web";
import { AppHeader } from "../components/AppHeader";
import { RoleIcon } from "../components/RoleIcon";
import { isRoleKey, ROLES } from "../lib/roles";
import { registerFreelancer, type FreelancerProfile } from "../lib/store";

export function RegisterPage() {
  const { role } = useParams<{ role: string }>();
  const theme = useTheme();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState<FreelancerProfile | null>(null);

  if (!isRoleKey(role)) {
    return <Navigate to="/" replace />;
  }

  const config = ROLES[role];

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!isRoleKey(role)) return;

    if (!name.trim() || !category.trim() || !phone.trim()) {
      setError("Please fill in name, category, and phone.");
      return;
    }

    setError("");
    const profile = registerFreelancer({ role, name: name.trim(), category: category.trim(), phone: phone.trim() });
    setRegistered(profile);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: theme.colors.background }}>
      <AppHeader crumb={`${config.label} / Register as Freelancer`} />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: `0 ${theme.spacing.xl}px` }}>
        <GlassCard>
          <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
            <RoleIcon role={role} size={48} />
            <div>
              <h1 style={{ margin: 0, fontSize: theme.typography.fontSize.xl, color: theme.colors.textPrimary }}>
                Register as a {config.label} Freelancer
              </h1>
              <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>
                Prototype registration -- saved locally so it can be found and booked.
              </p>
            </div>
          </div>

          {registered ? (
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md }}>
              <p style={{ color: theme.colors.success, fontWeight: 600 }}>
                ✓ Registered {registered.name} as a {config.label} freelancer.
              </p>
              <div style={{ display: "flex", gap: theme.spacing.sm, flexWrap: "wrap" }}>
                <Link to={`/role/${role}/find-service`}>
                  <Button label="Find Service now" />
                </Link>
                <Link to={`/role/${role}`}>
                  <Button label={`Back to ${config.label} screen`} variant="outline" />
                </Link>
                <Button
                  label="Register another"
                  variant="secondary"
                  onClick={() => {
                    setRegistered(null);
                    setName("");
                    setCategory("");
                    setPhone("");
                  }}
                />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: theme.spacing.lg }}>
              <Input label="Full name" placeholder="Juan Dela Cruz" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Category / skill" placeholder={config.categoryHint} value={category} onChange={(e) => setCategory(e.target.value)} />
              <Input label="Phone number" placeholder="09XX XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              {error ? <p style={{ color: theme.colors.error, fontSize: theme.typography.fontSize.sm, margin: 0 }}>{error}</p> : null}
              <div style={{ display: "flex", gap: theme.spacing.sm }}>
                <Button label="Submit registration" type="submit" />
                <Link to={`/role/${role}`}>
                  <Button label="Cancel" variant="secondary" />
                </Link>
              </div>
            </form>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
