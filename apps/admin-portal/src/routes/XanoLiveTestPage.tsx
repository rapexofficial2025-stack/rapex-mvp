import { useState, type CSSProperties } from "react";
import { ApiClientError, toErrorMessage, XanoAdminAuthRepository } from "@rapex/api-client";
import {
  rapexHttpClient,
  rapexAuthHttpClient,
  rapexAlphaAuthHttpClient,
  rapexOrdersHttpClient,
  rapexFinanceHttpClient,
} from "../services/apiConfig";
import { webTokenStorage } from "../services/webTokenStorage";
import { webUserCache } from "../services/userCache";

type PendingMerchant = {
  id: number;
  merchant_id: string;
  owner_name: string;
  email: string;
  approval_status: string;
  account_status: string;
};

type AdminProduct = {
  id: number;
  product_id: string;
  store_id: string;
  product_name: string;
  status: string;
};

type Paginated<T> = { items: T[]; itemsTotal: number };

/**
 * Direct, unmocked calls against live Xano -- super_app for /login, and
 * admin-master-data for /merchants and /products (confirmed fields only,
 * pulled from the real OpenAPI specs). Kept separate from
 * AdminRepository/MockAdminRepository since most of that interface has no
 * confirmed Xano endpoint yet.
 */
export function XanoLiveTestPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginResult, setLoginResult] = useState<unknown>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const [merchants, setMerchants] = useState<PendingMerchant[] | null>(null);
  const [merchantsError, setMerchantsError] = useState<string | null>(null);
  const [merchantsLoading, setMerchantsLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [productsLoading, setProductsLoading] = useState(false);

  // Alpha E2E: orders + wallet, unverified live -- reuses whatever token is
  // currently stored (from either login section above), same as testing
  // by hand with curl but from the browser and against real requests.
  type AlphaLogEntry = { label: string; ok: boolean; method: string; path: string; body: string };
  const [alphaLog, setAlphaLog] = useState<AlphaLogEntry[]>([]);
  const [alphaLoading, setAlphaLoading] = useState<string | null>(null);
  const [productId, setProductId] = useState("BURGER-001");
  const [orderId, setOrderId] = useState("");
  const [walletUserId, setWalletUserId] = useState("");

  const adminAuthRepo = new XanoAdminAuthRepository(rapexAuthHttpClient, webTokenStorage, webUserCache, "admin");

  /**
   * `endpoint` is recorded on every entry so a failure shows exactly which
   * Xano API group + path + HTTP method was hit (Phase 11 requirement) --
   * not just "something failed".
   */
  async function runAlpha(label: string, endpoint: { method: string; path: string }, fn: () => Promise<unknown>) {
    setAlphaLoading(label);
    try {
      const result = await fn();
      setAlphaLog((prev) => [{ label, ok: true, ...endpoint, body: JSON.stringify(result, null, 2) }, ...prev]);
    } catch (err) {
      const detail = err instanceof ApiClientError ? `HTTP ${err.status} (${err.code})\n${err.message}` : toErrorMessage(err);
      setAlphaLog((prev) => [{ label, ok: false, ...endpoint, body: detail }, ...prev]);
    } finally {
      setAlphaLoading(null);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    setLoginResult(null);
    try {
      const result = await rapexAuthHttpClient.request<{ authToken?: string }>({
        path: "/login",
        method: "POST",
        body: { email, password },
      });
      setLoginResult(result);
      if (result?.authToken) {
        await webTokenStorage.setToken(result.authToken);
        setHasToken(true);
      }
    } catch (err) {
      setLoginError(toErrorMessage(err));
    } finally {
      setLoginLoading(false);
    }
  }

  async function loadPendingMerchants() {
    setMerchantsLoading(true);
    setMerchantsError(null);
    try {
      const result = await rapexHttpClient.request<Paginated<PendingMerchant>>({
        path: "/merchants",
        method: "GET",
        query: { approval_status: "pending", page: 1, per_page: 25 },
      });
      setMerchants(result.items);
    } catch (err) {
      setMerchantsError(toErrorMessage(err));
    } finally {
      setMerchantsLoading(false);
    }
  }

  async function decideMerchant(id: number, decision: "approved" | "rejected") {
    setApprovingId(id);
    setMerchantsError(null);
    try {
      await rapexHttpClient.request({
        path: `/merchants/${id}`,
        method: "PATCH",
        body: { approval_status: decision },
      });
      setMerchants((prev) => (prev ? prev.filter((m) => m.id !== id) : prev));
    } catch (err) {
      setMerchantsError(toErrorMessage(err));
    } finally {
      setApprovingId(null);
    }
  }

  async function loadProducts() {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const result = await rapexHttpClient.request<Paginated<AdminProduct>>({
        path: "/products",
        method: "GET",
        query: { page: 1, per_page: 25 },
      });
      setProducts(result.items);
    } catch (err) {
      setProductsError(toErrorMessage(err));
    } finally {
      setProductsLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Xano Live Test (Admin)</h1>
      <p style={styles.note}>
        Calls the real Xano backend directly -- <code>super_app</code> for login, <code>admin-master-data</code> for
        merchants/products. Not mock data.
      </p>

      <section style={styles.card}>
        <h2 style={styles.h2}>1. Login (POST /login)</h2>
        <form style={styles.form} onSubmit={handleLogin}>
          <input style={styles.input} type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" style={styles.button} disabled={loginLoading}>
            {loginLoading ? "Signing in..." : "Sign In on Xano"}
          </button>
        </form>
        {loginError ? <pre style={styles.errorBox}>{loginError}</pre> : null}
        {loginResult ? <pre style={styles.resultBox}>{JSON.stringify(loginResult, null, 2)}</pre> : null}
        {hasToken ? <p style={styles.success}>Token stored -- sections below will send it as Bearer auth.</p> : null}
      </section>

      <section style={styles.card}>
        <h2 style={styles.h2}>2. Merchant Approval (GET /merchants?approval_status=pending, PATCH /merchants/:id)</h2>
        {!hasToken ? <p style={styles.warn}>Sign in first -- this needs the auth token from step 1.</p> : null}
        <button type="button" style={styles.button} onClick={loadPendingMerchants} disabled={merchantsLoading || !hasToken}>
          {merchantsLoading ? "Loading..." : "Load Pending Merchants"}
        </button>
        {merchantsError ? <pre style={styles.errorBox}>{merchantsError}</pre> : null}
        {merchants ? (
          merchants.length === 0 ? (
            <p style={styles.note}>No pending merchants.</p>
          ) : (
            <ul style={styles.list}>
              {merchants.map((m) => (
                <li key={m.id} style={styles.listItem}>
                  <div>
                    <strong>{m.owner_name}</strong> -- {m.email} ({m.merchant_id})
                  </div>
                  <div style={styles.rowButtons}>
                    <button
                      type="button"
                      style={{ ...styles.smallButton, background: "#166534" }}
                      disabled={approvingId === m.id}
                      onClick={() => decideMerchant(m.id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      style={{ ...styles.smallButton, background: "#B91C1C" }}
                      disabled={approvingId === m.id}
                      onClick={() => decideMerchant(m.id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : null}
      </section>

      <section style={styles.card}>
        <h2 style={styles.h2}>3. Products (GET /products)</h2>
        {!hasToken ? <p style={styles.warn}>Sign in first -- this needs the auth token from step 1.</p> : null}
        <button type="button" style={styles.button} onClick={loadProducts} disabled={productsLoading || !hasToken}>
          {productsLoading ? "Loading..." : "Load Products"}
        </button>
        {productsError ? <pre style={styles.errorBox}>{productsError}</pre> : null}
        {products ? (
          products.length === 0 ? (
            <p style={styles.note}>No products yet.</p>
          ) : (
            <ul style={styles.list}>
              {products.map((p) => (
                <li key={p.id} style={styles.listItem}>
                  <strong>{p.product_name}</strong> -- store {p.store_id} -- {p.status}
                </li>
              ))}
            </ul>
          )
        ) : null}
      </section>

      <section style={styles.card}>
        <h2 style={styles.h2}>4. Phase 1: Admin Auth via the real repository (super_app)</h2>
        <p style={styles.note}>
          Exercises the exact code path AppProviders.tsx wires up (XanoAdminAuthRepository → POST /login on the
          super_app group), not a raw fetch -- proves Admin Login → Xano authentication → session token →
          getCurrentUser() end-to-end.
        </p>
        <div style={styles.rowButtons}>
          <button
            type="button"
            style={styles.smallButton2}
            disabled={alphaLoading !== null}
            onClick={() => runAlpha("Admin Login (repository)", { method: "POST", path: "super_app: /login" }, () => adminAuthRepo.login({ email, password }))}
          >
            Admin Login (repository)
          </button>
          <button
            type="button"
            style={styles.smallButton2}
            disabled={alphaLoading !== null}
            onClick={() => runAlpha("getCurrentUser() (session check)", { method: "n/a", path: "local token + user cache" }, () => adminAuthRepo.getCurrentUser())}
          >
            getCurrentUser() (session check)
          </button>
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.h2}>5. Alpha E2E: Auth / Orders / Wallet (unverified live)</h2>
        <p style={styles.note}>
          Reuses whichever token is currently stored above. Log in with the role you're about to test first (e.g. use
          section 1 with irvin@rapex.ph / password123 for customer, burger@rapex.ph / password123 for merchant,
          rider@rapex.ph / password123 for rider), then click the buttons for that role below in order.
        </p>

        <div style={styles.rowButtons}>
          <button
            type="button"
            style={styles.smallButton2}
            disabled={alphaLoading !== null}
            onClick={() =>
              runAlpha("Login (rapex-auth group)", { method: "POST", path: "rapex-auth: /auth/login" }, async () => {
                const r = await rapexAlphaAuthHttpClient.request<{ authToken?: string; data?: { authToken?: string } }>({
                  path: "/auth/login",
                  method: "POST",
                  body: { email, password },
                });
                const token = r?.data?.authToken ?? r?.authToken;
                if (token) await webTokenStorage.setToken(token);
                return r;
              })
            }
          >
            Login (rapex-auth)
          </button>
          <button
            type="button"
            style={styles.smallButton2}
            disabled={alphaLoading !== null}
            onClick={() => runAlpha("Get Wallet", { method: "GET", path: "rapex-finance: /balance" }, () => rapexFinanceHttpClient.request({ path: "/balance", method: "GET" }))}
          >
            Get Wallet
          </button>
        </div>

        <div style={styles.rowButtons}>
          <input style={styles.input} value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="product id" />
          <button
            type="button"
            style={styles.smallButton2}
            disabled={alphaLoading !== null}
            onClick={() =>
              runAlpha("Checkout / Create Order", { method: "POST", path: "rapex-orders: /create" }, async () => {
                const r = await rapexOrdersHttpClient.request<{ order_id?: string | number }>({
                  path: "/create",
                  method: "POST",
                  body: {
                    items: [{ product_id: productId, quantity: 1 }],
                    delivery_lat: 14.5995,
                    delivery_lng: 120.9842,
                    payment_method: "wallet",
                  },
                });
                if (r?.order_id) setOrderId(String(r.order_id));
                return r;
              })
            }
          >
            Checkout / Create Order
          </button>
        </div>
        <p style={styles.note}>No separate cart endpoint confirmed -- Checkout creates the order directly.</p>

        <div style={styles.rowButtons}>
          <input style={styles.input} value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="order id" />
        </div>
        <div style={styles.rowButtons}>
          <span style={styles.note}>Merchant:</span>
          {(["merchant_accepted", "preparing", "ready_for_pickup"] as const).map((status) => (
            <button
              key={status}
              type="button"
              style={styles.smallButton2}
              disabled={alphaLoading !== null || !orderId}
              onClick={() =>
                runAlpha(status, { method: "PATCH", path: "rapex-orders: /update_status" }, () =>
                  rapexOrdersHttpClient.request({ path: "/update_status", method: "PATCH", body: { order_id: orderId, status } }),
                )
              }
            >
              {status}
            </button>
          ))}
        </div>
        <div style={styles.rowButtons}>
          <span style={styles.note}>Rider:</span>
          {(["rider_accepted", "picked_up", "delivering", "completed"] as const).map((status) => (
            <button
              key={status}
              type="button"
              style={styles.smallButton2}
              disabled={alphaLoading !== null || !orderId}
              onClick={() =>
                runAlpha(status, { method: "PATCH", path: "rapex-orders: /update_status" }, () =>
                  rapexOrdersHttpClient.request({ path: "/update_status", method: "PATCH", body: { order_id: orderId, status } }),
                )
              }
            >
              {status}
            </button>
          ))}
        </div>

        <div style={styles.rowButtons}>
          <input style={styles.input} value={walletUserId} onChange={(e) => setWalletUserId(e.target.value)} placeholder="user_id (admin only)" />
          <button
            type="button"
            style={styles.smallButton2}
            disabled={alphaLoading !== null || !walletUserId}
            onClick={() =>
              runAlpha("Admin Wallet Adjust (probe, amount 0)", { method: "PATCH", path: "admin: /wallet/adjust" }, () =>
                rapexHttpClient.request({
                  path: "/wallet/adjust",
                  method: "PATCH",
                  body: { user_id: walletUserId, amount: 0, action: "add", reason: "Alpha console probe" },
                }),
              )
            }
          >
            Wallet Summary (Admin)
          </button>
        </div>

        {alphaLog.map((entry, i) => (
          <div key={i} style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: entry.ok ? "#166534" : "#B91C1C" }}>
              {entry.ok ? "✓" : "✗ STOP —"} {entry.label} <span style={{ fontWeight: 400, color: "#666" }}>({entry.method} {entry.path})</span>
            </div>
            <pre style={entry.ok ? styles.resultBox : styles.errorBox}>{entry.body}</pre>
          </div>
        ))}
      </section>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 680, margin: "0 auto", padding: 24, fontFamily: "inherit", color: "#111" },
  h1: { fontSize: 22, marginBottom: 4 },
  h2: { fontSize: 16, marginBottom: 12 },
  note: { fontSize: 13, color: "#666", marginBottom: 12 },
  card: { border: "1px solid #ddd", borderRadius: 12, padding: 20, marginBottom: 20, background: "#fff" },
  form: { display: "flex", flexDirection: "column", gap: 10 },
  input: { border: "1px solid #ccc", borderRadius: 8, padding: "10px 12px", fontSize: 14, fontFamily: "inherit" },
  button: {
    border: "none",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    background: "linear-gradient(90deg, #8B5CF6, #F97316)",
    color: "#fff",
  },
  smallButton: {
    border: "none",
    borderRadius: 6,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
  },
  smallButton2: {
    border: "none",
    borderRadius: 6,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
    background: "#4C1D95",
  },
  errorBox: { background: "#FEF2F2", color: "#B91C1C", padding: 12, borderRadius: 8, fontSize: 12, marginTop: 12, whiteSpace: "pre-wrap" },
  resultBox: { background: "#F0FDF4", color: "#166534", padding: 12, borderRadius: 8, fontSize: 12, marginTop: 12, whiteSpace: "pre-wrap", overflowX: "auto" },
  success: { color: "#166534", fontSize: 13, marginTop: 8 },
  warn: { color: "#B45309", fontSize: 13, marginBottom: 8 },
  list: { listStyle: "none", padding: 0, marginTop: 12, display: "flex", flexDirection: "column", gap: 8 },
  listItem: {
    border: "1px solid #eee",
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  rowButtons: { display: "flex", gap: 6 },
};
