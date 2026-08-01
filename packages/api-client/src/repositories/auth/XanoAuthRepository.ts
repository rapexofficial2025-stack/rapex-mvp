import type { HttpClient } from "../../core/httpClient";

/**
 * SKELETON ONLY -- does not `implements AuthRepository` yet and is not
 * exported from the package index or wired into any RepositoryProvider.
 *
 * Paths, methods, and the header layer (via the injected HttpClient from
 * createRapexHttpClient) are wired exactly per the frozen Alpha API
 * contract, in the given integration order. Request bodies and response
 * parsing are deliberately left as `unknown` -- writing real field mappings
 * now would mean guessing Xano's actual field names, which the contract
 * explicitly forbids ("stop and report instead of guessing").
 *
 * Once the field-level schema is available (from the OpenAPI export):
 * 1. Replace each `unknown` with the real request/response types.
 * 2. Map the response onto the existing AuthUser/AuthSession shapes from
 *    repositories/types.ts (or update those types if Xano's shape differs).
 * 3. Have this class `implements AuthRepository`.
 * 4. Swap MockAuthRepository for this class in each app's AppProviders.tsx.
 * No screen or hook needs to change for any of that.
 */
export class XanoAuthRepositorySkeleton {
  constructor(private readonly client: HttpClient) {}

  /** POST /rapex-auth/auth/signup -- TODO: request body fields, response fields, error shape */
  async signup(body: unknown): Promise<unknown> {
    return this.client.request({ path: "/rapex-auth/auth/signup", method: "POST", body });
  }

  /** POST /rapex-auth/verify-otp -- TODO: request body fields, response fields */
  async verifyOtp(body: unknown): Promise<unknown> {
    return this.client.request({ path: "/rapex-auth/verify-otp", method: "POST", body });
  }

  /** POST /rapex-auth/complete-profile -- TODO: request body fields, response fields */
  async completeProfile(body: unknown): Promise<unknown> {
    return this.client.request({ path: "/rapex-auth/complete-profile", method: "POST", body });
  }

  /** POST /rapex-auth/auth/login -- TODO: request body fields, response fields */
  async login(body: unknown): Promise<unknown> {
    return this.client.request({ path: "/rapex-auth/auth/login", method: "POST", body });
  }

  /** GET /rapex-auth/auth/me -- TODO: response fields (current user shape) */
  async me(): Promise<unknown> {
    return this.client.request({ path: "/rapex-auth/auth/me", method: "GET" });
  }
}
