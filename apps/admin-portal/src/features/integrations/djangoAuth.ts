/**
 * Self-contained auth for the Integrations (API Keys) screen -- talks
 * directly to the real Django backend, independent of the app's main
 * (mock) admin session. Session token lives in sessionStorage only
 * (cleared when the tab closes) under its own key, on purpose: this
 * screen holds the platform's real secrets and shouldn't share a
 * storage slot with anything else.
 */
const DJANGO_API_BASE_URL = import.meta.env.VITE_DJANGO_API_BASE_URL ?? "http://localhost:8000";
const SESSION_KEY = "rapex_integrations_django_token";

export type DjangoJwtClaims = {
  role: string;
  email: string;
  user_id: string;
  exp: number;
};

export function decodeJwt(token: string): DjangoJwtClaims | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return sessionStorage.getItem(SESSION_KEY);
}

export function clearStoredToken(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

export async function loginToDjango(email: string, password: string): Promise<DjangoJwtClaims> {
  const res = await fetch(`${DJANGO_API_BASE_URL}/api/v1/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.success) {
    throw new Error(body?.errors?.detail ?? body?.message ?? `Login failed (${res.status})`);
  }
  const token: string = body.data.access;
  const claims = decodeJwt(token);
  if (!claims) throw new Error("Received an unreadable token from the server.");
  sessionStorage.setItem(SESSION_KEY, token);
  return claims;
}

export type MaskedCredential = {
  service_key: string;
  label: string;
  category: string;
  help_text: string;
  is_set: boolean;
  masked_preview: string | null;
  updated_at: string;
};

async function authedFetch(path: string, init?: RequestInit) {
  const token = getStoredToken();
  if (!token) throw new Error("Not signed in.");
  const res = await fetch(`${DJANGO_API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (res.status === 401) {
    clearStoredToken();
    throw new Error("Session expired -- sign in again.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.success === false) {
    throw new Error(body?.errors?.detail ?? body?.message ?? `Request failed (${res.status})`);
  }
  return body;
}

export async function fetchCredentials(): Promise<MaskedCredential[]> {
  const body = await authedFetch("/api/v1/superadmin/config/credentials/");
  return body.data;
}

export async function saveCredential(serviceKey: string, value: string): Promise<void> {
  await authedFetch(`/api/v1/superadmin/config/credentials/${serviceKey}/`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
}

export async function clearCredential(serviceKey: string): Promise<void> {
  await authedFetch(`/api/v1/superadmin/config/credentials/${serviceKey}/`, { method: "DELETE" });
}
