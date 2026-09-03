import { createRapexHttpClient } from "@rapex/api-client";
import { secureTokenStorage } from "./secureTokenStorage";

/**
 * Prepared, not yet used by any repository or screen -- Mock repositories
 * remain active until the field-level API schema is available. This proves
 * the env-config -> token-storage -> client wiring works end-to-end so that
 * swapping in real Xano* repositories later is a one-line change per
 * repository, not new plumbing.
 */
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!API_BASE_URL && __DEV__) {
  console.warn(
    "EXPO_PUBLIC_API_BASE_URL is not set -- see .env.example. The Xano-backed API client cannot be used until it is.",
  );
}

export const rapexHttpClient = createRapexHttpClient({
  baseUrl: API_BASE_URL ?? "",
  appId: "buyer",
  tokenStorage: secureTokenStorage,
});

/**
 * Real Xano `rapex-auth` API group -- confirmed live 2026-08-03 handover.
 * Separate base URL from rapexHttpClient above because Xano splits each
 * domain into its own API group with its own `api:{group}` base path
 * (rapex-auth, rapex-orders, rapex-market, admin-master-data, super_app).
 * Same token storage across all of them -- one JWT, one Xano instance.
 */
const AUTH_API_BASE_URL = process.env.EXPO_PUBLIC_AUTH_API_BASE_URL ?? "https://x8ki-letl-twmt.n7.xano.io/api:rapex-auth";

export const rapexAuthHttpClient = createRapexHttpClient({
  baseUrl: AUTH_API_BASE_URL,
  appId: "buyer",
  tokenStorage: secureTokenStorage,
});

/** Real Xano `rapex-orders` API group -- unverified live, see XanoOrdersRepository doc comment. */
const ORDERS_API_BASE_URL =
  process.env.EXPO_PUBLIC_ORDERS_API_BASE_URL ?? "https://x8ki-letl-twmt.n7.xano.io/api:rapex-orders";

export const rapexOrdersHttpClient = createRapexHttpClient({
  baseUrl: ORDERS_API_BASE_URL,
  appId: "buyer",
  tokenStorage: secureTokenStorage,
});

/** Real Xano `rapex-finance` API group -- unverified live, see XanoWalletRepository doc comment. */
const FINANCE_API_BASE_URL =
  process.env.EXPO_PUBLIC_FINANCE_API_BASE_URL ?? "https://x8ki-letl-twmt.n7.xano.io/api:rapex-finance";

export const rapexFinanceHttpClient = createRapexHttpClient({
  baseUrl: FINANCE_API_BASE_URL,
  appId: "buyer",
  tokenStorage: secureTokenStorage,
});

/**
 * Real Xano `super_app` API group -- confirmed live 2026-08-14 handover.
 * Backs the location cascading picker (regions/provinces/municipalities/
 * barangays) and the KYC asset upload. Same group admin-portal already
 * uses for its own login (see admin-portal/src/services/apiConfig.ts) --
 * different apps, same instance/group, per-app appId header only.
 */
const SUPER_APP_API_BASE_URL =
  process.env.EXPO_PUBLIC_SUPER_APP_API_BASE_URL ?? "https://x8ki-letl-twmt.n7.xano.io/api:super_app";

export const rapexSuperAppHttpClient = createRapexHttpClient({
  baseUrl: SUPER_APP_API_BASE_URL,
  appId: "buyer",
  tokenStorage: secureTokenStorage,
});

/** Real Xano `rapex-core` API group -- confirmed live 2026-08-14 handover. Backs the Culture/Community list (community-master). */
const CORE_API_BASE_URL = process.env.EXPO_PUBLIC_CORE_API_BASE_URL ?? "https://x8ki-letl-twmt.n7.xano.io/api:rapex-core";

export const rapexCoreHttpClient = createRapexHttpClient({
  baseUrl: CORE_API_BASE_URL,
  appId: "buyer",
  tokenStorage: secureTokenStorage,
});
