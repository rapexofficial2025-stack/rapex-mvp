import { useState, type CSSProperties } from "react";
import { toErrorMessage } from "@rapex/api-client";
import { rapexHttpClient } from "../services/apiConfig";
import { webTokenStorage } from "../services/webTokenStorage";

/**
 * Direct, unmocked calls against the live Xano `super_app` group -- confirmed
 * field names only (pulled from the real OpenAPI spec, not guessed). Kept
 * separate from MerchantRepository/MockMerchantRepository on purpose: most of
 * that interface (variants, expansion requests, insights, CSV import...) has
 * no confirmed Xano endpoint yet, so implementing it now would mean guessing.
 * This page exists purely to prove the real signup -> store creation path
 * works end to end before any repository gets swapped over.
 */
export function XanoLiveTestPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [registerResult, setRegisterResult] = useState<unknown>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState("Food");
  const [provinceId, setProvinceId] = useState("");
  const [municipalityId, setMunicipalityId] = useState("");
  const [barangayId, setBarangayId] = useState("");
  const [address, setAddress] = useState("");
  const [storeResult, setStoreResult] = useState<unknown>(null);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [storeLoading, setStoreLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError(null);
    setRegisterResult(null);
    try {
      const result = await rapexHttpClient.request<{ authToken?: string }>({
        path: "/auth/signup",
        method: "POST",
        body: { full_name: fullName, email, mobile, password, role: "merchant" },
      });
      setRegisterResult(result);
      if (result?.authToken) {
        await webTokenStorage.setToken(result.authToken);
        setHasToken(true);
      }
    } catch (err) {
      setRegisterError(toErrorMessage(err));
    } finally {
      setRegisterLoading(false);
    }
  }

  async function handleCreateStore(e: React.FormEvent) {
    e.preventDefault();
    setStoreLoading(true);
    setStoreError(null);
    setStoreResult(null);
    try {
      const result = await rapexHttpClient.request({
        path: "/stores/create",
        method: "POST",
        body: {
          name: storeName,
          category,
          province_id: Number(provinceId),
          municipality_id: Number(municipalityId),
          barangay_id: Number(barangayId),
          address,
        },
      });
      setStoreResult(result);
    } catch (err) {
      setStoreError(toErrorMessage(err));
    } finally {
      setStoreLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.h1}>Xano Live Test</h1>
      <p style={styles.note}>
        Calls the real Xano <code>super_app</code> group directly (not mock data). Confirmed endpoints only --
        product upload isn't wired here because Xano has no single-product create endpoint yet (see chat).
      </p>

      <section style={styles.card}>
        <h2 style={styles.h2}>1. Register (POST /auth/signup, role=merchant)</h2>
        <form style={styles.form} onSubmit={handleRegister}>
          <input style={styles.input} placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" style={styles.button} disabled={registerLoading}>
            {registerLoading ? "Registering..." : "Register on Xano"}
          </button>
        </form>
        {registerError ? <pre style={styles.errorBox}>{registerError}</pre> : null}
        {registerResult ? <pre style={styles.resultBox}>{JSON.stringify(registerResult, null, 2)}</pre> : null}
        {hasToken ? <p style={styles.success}>Token stored -- Create Store below will send it as Bearer auth.</p> : null}
      </section>

      <section style={styles.card}>
        <h2 style={styles.h2}>2. Create Store (POST /stores/create)</h2>
        {!hasToken ? <p style={styles.warn}>Register first -- store creation requires the auth token from step 1.</p> : null}
        <form style={styles.form} onSubmit={handleCreateStore}>
          <input style={styles.input} placeholder="Store name" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
          <select style={styles.input} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>Food</option>
            <option>Marketplace</option>
            <option>Wholesale</option>
            <option>Industrial</option>
            <option>Agriculture</option>
            <option>Services</option>
            <option>Auction</option>
          </select>
          <input style={styles.input} placeholder="Province ID" value={provinceId} onChange={(e) => setProvinceId(e.target.value)} required />
          <input style={styles.input} placeholder="Municipality ID" value={municipalityId} onChange={(e) => setMunicipalityId(e.target.value)} required />
          <input style={styles.input} placeholder="Barangay ID" value={barangayId} onChange={(e) => setBarangayId(e.target.value)} required />
          <input style={styles.input} placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          <button type="submit" style={styles.button} disabled={storeLoading || !hasToken}>
            {storeLoading ? "Creating..." : "Create Store on Xano"}
          </button>
        </form>
        {storeError ? <pre style={styles.errorBox}>{storeError}</pre> : null}
        {storeResult ? <pre style={styles.resultBox}>{JSON.stringify(storeResult, null, 2)}</pre> : null}
      </section>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 640, margin: "0 auto", padding: 24, fontFamily: "inherit" },
  h1: { fontSize: 22, marginBottom: 4 },
  h2: { fontSize: 16, marginBottom: 12 },
  note: { fontSize: 13, color: "#666", marginBottom: 24 },
  card: { border: "1px solid #ddd", borderRadius: 12, padding: 20, marginBottom: 20 },
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
  errorBox: { background: "#FEF2F2", color: "#B91C1C", padding: 12, borderRadius: 8, fontSize: 12, marginTop: 12, whiteSpace: "pre-wrap" },
  resultBox: { background: "#F0FDF4", color: "#166534", padding: 12, borderRadius: 8, fontSize: 12, marginTop: 12, whiteSpace: "pre-wrap", overflowX: "auto" },
  success: { color: "#166534", fontSize: 13, marginTop: 8 },
  warn: { color: "#B45309", fontSize: 13, marginBottom: 8 },
};
