import { createRapexHttpClient } from "@rapex/api-client";
import { webTokenStorage } from "./webTokenStorage";

/**
 * Prepared, not yet used by any repository or screen -- Mock repositories
 * remain active until the field-level API schema is available.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL && import.meta.env.DEV) {
  console.warn(
    "VITE_API_BASE_URL is not set -- see .env.example. The Xano-backed API client cannot be used until it is.",
  );
}

export const rapexHttpClient = createRapexHttpClient({
  baseUrl: API_BASE_URL ?? "",
  appId: "merchant",
  tokenStorage: webTokenStorage,
});

/** Real Xano `rapex-auth` group -- confirmed live 2026-08-03 handover. */
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_BASE_URL ?? "https://x8ki-letl-twmt.n7.xano.io/api:rapex-auth";

export const rapexAuthHttpClient = createRapexHttpClient({
  baseUrl: AUTH_API_BASE_URL,
  appId: "merchant",
  tokenStorage: webTokenStorage,
});

/** Real Xano `admin-master-data` group (stores/products) -- confirmed live 2026-08-03 handover. */
const MASTER_DATA_API_BASE_URL =
  import.meta.env.VITE_MASTER_DATA_API_BASE_URL ?? "https://x8ki-letl-twmt.n7.xano.io/api:admin-master-data";

export const rapexMasterDataHttpClient = createRapexHttpClient({
  baseUrl: MASTER_DATA_API_BASE_URL,
  appId: "merchant",
  tokenStorage: webTokenStorage,
});

/** Real Xano `super_app` group -- confirmed live 2026-08-14 handover. Backs the generic asset upload (ID front/back, selfie, profile photo) used during onboarding. */
const SUPER_APP_API_BASE_URL =
  import.meta.env.VITE_SUPER_APP_API_BASE_URL ?? "https://x8ki-letl-twmt.n7.xano.io/api:super_app";

export const rapexSuperAppHttpClient = createRapexHttpClient({
  baseUrl: SUPER_APP_API_BASE_URL,
  appId: "merchant",
  tokenStorage: webTokenStorage,
});
