import type { AuthRepository, LoginInput, RegisterInput } from "./AuthRepository";
import type { AuthSession, AuthUser } from "../types";

const MOCK_DELAY_MS = 400;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_DELAY_MS));
}

const MOCK_USER: AuthUser = {
  id: "user-1",
  name: "Juan dela Cruz",
  email: "juan@example.com",
  phone: "09171234567",
  role: "customer",
};

let currentUser: AuthUser | null = null;

/** Stands in for the real Xano-backed AuthRepository until the Auth contract is provided. */
export class MockAuthRepository implements AuthRepository {
  async register(input: RegisterInput): Promise<AuthSession> {
    const user: AuthUser = { ...MOCK_USER, name: input.name, email: input.email, phone: input.phone };
    currentUser = user;
    return delay({ user, token: "mock-token" });
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const user: AuthUser = { ...MOCK_USER, email: input.email };
    currentUser = user;
    return delay({ user, token: "mock-token" });
  }

  async requestOtp(_destination: string): Promise<void> {
    return delay(undefined);
  }

  async verifyOtp(_destination: string, _code: string): Promise<AuthSession> {
    const user = currentUser ?? MOCK_USER;
    currentUser = user;
    return delay({ user, token: "mock-token" });
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return delay(currentUser);
  }

  async logout(): Promise<void> {
    currentUser = null;
    return delay(undefined);
  }
}
