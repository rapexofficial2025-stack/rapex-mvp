import { createRapexHttpClient } from "@rapex/api-client";
import { webTokenStorage } from "./webTokenStorage";

/**
 * Prepared, not yet used by any repository or screen -- Mock repositories
 * remain active until the field-level API schema is available.
 *
 * Admin uses its own base URL (VITE_ADMIN_API_BASE_URL, not
 * VITE_API_BASE_URL) because for Alpha it may keep pointing at a temporary
 * GitHub deployment URL until the production admin domain is ready -- this
 * lets that switch happen via env config later, with zero code changes.
 */
const API_BASE_URL = import.meta.env.VITE_ADMIN_API_BASE_URL;

if (!API_BASE_URL && import.meta.env.DEV) {
  console.warn(
    "VITE_ADMIN_API_BASE_URL is not set -- see .env.example. The Xano-backed API client cannot be used until it is.",
  );
}

export const rapexHttpClient = createRapexHttpClient({
  baseUrl: API_BASE_URL ?? "",
  appId: "admin",
  tokenStorage: webTokenStorage,
});

/**
 * Separate client for the `super_app` Xano group -- that's where /login
 * actually lives (confirmed via live OpenAPI spec fetch), not in
 * admin-master-data. Same host/instance, same tokenStorage, different API
 * group path. Only used by XanoLiveTestPage.tsx for now.
 */
export const rapexAuthHttpClient = createRapexHttpClient({
  baseUrl: "https://x8ki-letl-twmt.n7.xano.io/api:super_app",
  appId: "admin",
  tokenStorage: webTokenStorage,
});

/** rapex-auth group's own /auth/login (distinct from super_app's /login) -- used by XanoLiveTestPage's Alpha E2E section. */
export const rapexAlphaAuthHttpClient = createRapexHttpClient({
  baseUrl: "https://x8ki-letl-twmt.n7.xano.io/api:rapex-auth",
  appId: "admin",
  tokenStorage: webTokenStorage,
});

/** rapex-orders group -- order create/status transitions, unverified live, Alpha E2E test section only. */
export const rapexOrdersHttpClient = createRapexHttpClient({
  baseUrl: "https://x8ki-letl-twmt.n7.xano.io/api:rapex-orders",
  appId: "admin",
  tokenStorage: webTokenStorage,
});

/** rapex-finance group -- wallet balance, unverified live, Alpha E2E test section only. */
export const rapexFinanceHttpClient = createRapexHttpClient({
  baseUrl: "https://x8ki-letl-twmt.n7.xano.io/api:rapex-finance",
  appId: "admin",
  tokenStorage: webTokenStorage,
});
