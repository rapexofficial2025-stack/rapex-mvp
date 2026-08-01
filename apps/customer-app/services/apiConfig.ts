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
