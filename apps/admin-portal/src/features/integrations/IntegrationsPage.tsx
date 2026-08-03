import { useEffect, useState } from "react";
import { Badge, Button, ErrorState, GlassCard, Input, Loading, useTheme } from "@rapex/ui-web";
import {
  clearCredential,
  clearStoredToken,
  decodeJwt,
  fetchCredentials,
  getStoredToken,
  loginToDjango,
  saveCredential,
  type MaskedCredential,
} from "./djangoAuth";

const CATEGORY_LABEL: Record<string, string> = {
  MAPS: "Maps",
  PAYMENT: "Payment",
  SMS: "SMS",
  PUSH: "Push Notifications",
  STORAGE: "File Storage",
  OTHER: "Other",
};

function groupByCategory(credentials: MaskedCredential[]): [string, MaskedCredential[]][] {
  const groups = new Map<string, MaskedCredential[]>();
  for (const c of credentials) {
    const list = groups.get(c.category) ?? [];
    list.push(c);
    groups.set(c.category, list);
  }
  return Array.from(groups.entries());
}

function CredentialBox({ credential, onChanged }: { credential: MaskedCredential; onChanged: () => void }) {
  const theme = useTheme();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <GlassCard>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: theme.spacing.sm }}>
        <div>
          <div style={{ fontWeight: 700, color: theme.colors.textPrimary }}>{credential.label}</div>
          <div style={{ fontSize: theme.typography.fontSize.xs, color: theme.colors.textSecondary, marginTop: theme.spacing.xxs }}>
            {credential.help_text}
          </div>
        </div>
        <Badge
          label={credential.is_set ? `Set • ${credential.masked_preview}` : "Not set"}
          tone={credential.is_set ? "success" : "neutral"}
        />
      </div>

      <div style={{ display: "flex", gap: theme.spacing.sm, marginTop: theme.spacing.sm, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <Input
            type="password"
            placeholder={credential.is_set ? "Paste a new value to replace it…" : "Paste the key here…"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <Button
          label="Save"
          loading={saving}
          disabled={!value.trim()}
          onClick={async () => {
            setSaving(true);
            setError(null);
            try {
              await saveCredential(credential.service_key, value);
              setValue("");
              onChanged();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not save.");
            } finally {
              setSaving(false);
            }
          }}
        />
        {credential.is_set ? (
          <Button
            label="Clear"
            variant="danger"
            onClick={async () => {
              setError(null);
              try {
                await clearCredential(credential.service_key);
                onChanged();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Could not clear.");
              }
            }}
          />
        ) : null}
      </div>
      {error ? <div style={{ color: theme.colors.error, fontSize: theme.typography.fontSize.xs, marginTop: theme.spacing.xs }}>{error}</div> : null}
    </GlassCard>
  );
}

export function IntegrationsPage() {
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [credentials, setCredentials] = useState<MaskedCredential[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      const claims = decodeJwt(token);
      if (claims && claims.exp * 1000 > Date.now()) {
        setRole(claims.role);
      } else {
        clearStoredToken();
      }
    }
  }, []);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setCredentials(await fetchCredentials());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Could not load credentials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "SUPERADMIN") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  if (!role) {
    return (
      <div style={{ padding: 24, maxWidth: 420 }}>
        <h2 style={{ margin: 0, color: theme.colors.textPrimary }}>API Keys</h2>
        <p style={{ color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
          SuperAdmin sign-in required. This is separate from your main portal login -- only you know these credentials.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {loginError ? <ErrorState description={loginError} /> : null}
          <Button
            label="Sign In"
            loading={loginLoading}
            onClick={async () => {
              setLoginLoading(true);
              setLoginError(null);
              try {
                const claims = await loginToDjango(email, password);
                if (claims.role !== "SUPERADMIN") {
                  setLoginError("This account is not SuperAdmin -- access denied.");
                  clearStoredToken();
                  return;
                }
                setRole(claims.role);
              } catch (err) {
                setLoginError(err instanceof Error ? err.message : "Login failed.");
              } finally {
                setLoginLoading(false);
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: theme.spacing.md, maxWidth: 720 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, color: theme.colors.textPrimary }}>API Keys</h2>
          <p style={{ margin: 0, color: theme.colors.textSecondary, fontSize: theme.typography.fontSize.sm }}>
            Paste a key, hit Save. Values are encrypted at rest and never shown again once saved -- only you can set them.
          </p>
        </div>
        <Button
          label="Sign Out"
          variant="secondary"
          onClick={() => {
            clearStoredToken();
            setRole(null);
            setCredentials(null);
          }}
        />
      </div>

      {loading ? <Loading /> : loadError ? <ErrorState description={loadError} onRetry={load} /> : null}

      {credentials
        ? groupByCategory(credentials).map(([category, items]) => (
            <div key={category}>
              <div style={{ fontSize: theme.typography.fontSize.sm, fontWeight: 700, color: theme.colors.textSecondary, marginBottom: theme.spacing.xs, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {CATEGORY_LABEL[category] ?? category}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
                {items.map((c) => (
                  <CredentialBox key={c.service_key} credential={c} onChanged={load} />
                ))}
              </div>
            </div>
          ))
        : null}
    </div>
  );
}
