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
