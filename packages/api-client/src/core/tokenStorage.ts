/**
 * Platform-agnostic contract. Concrete implementations are platform-specific
 * (SecureStore for RN, localStorage for web) and live in each app, not here
 * -- this package must stay importable by both without pulling in
 * RN-only or DOM-only APIs.
 */
export interface TokenStorage {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
}

/** In-memory fallback -- useful for tests, or an app that hasn't wired real storage yet. */
export class InMemoryTokenStorage implements TokenStorage {
  private token: string | null = null;

  async getToken(): Promise<string | null> {
    return this.token;
  }

  async setToken(token: string): Promise<void> {
    this.token = token;
  }

  async clearToken(): Promise<void> {
    this.token = null;
  }
}
