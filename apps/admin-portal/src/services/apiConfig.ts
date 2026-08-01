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
