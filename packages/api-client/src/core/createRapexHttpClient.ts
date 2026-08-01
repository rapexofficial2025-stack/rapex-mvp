import { createHttpClient, type HttpClient } from "./httpClient";

/**
 * Matches the X-RAPEX-App header values from the frozen Alpha API contract.
 * "buyer" is Xano's name for the customer role -- kept exactly as specified,
 * not renamed to "customer" for internal consistency, per "do not rename
 * request or response fields."
 */
export type RapexAppId = "buyer" | "merchant" | "admin";

export type RapexHttpClientConfig = {
  baseUrl: string;
  appId: RapexAppId;
  getAuthToken: () => string | null | Promise<string | null>;
  /** Defaults to "en-PH" per the contract; override only if a real locale switcher is added. */
  language?: string;
};

/**
 * The header layer from the frozen Alpha API contract: Authorization Bearer
 * token, Content-Type, X-RAPEX-App, Accept-Language. Every Xano* repository
 * is built on a client created here -- one place to get the contract's
 * header requirements right instead of repeating them per repository.
 */
export function createRapexHttpClient(config: RapexHttpClientConfig): HttpClient {
  return createHttpClient({
    baseUrl: config.baseUrl,
    getAuthToken: config.getAuthToken,
    staticHeaders: {
      "X-RAPEX-App": config.appId,
      "Accept-Language": config.language ?? "en-PH",
    },
  });
}
