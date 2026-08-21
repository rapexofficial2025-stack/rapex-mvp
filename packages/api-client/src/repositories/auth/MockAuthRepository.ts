import type { AuthMeResponse, AuthRepository, GoogleProfileInput, LoginInput, LoginResult, NextStep, RegisterInput, RegisterResult } from "./AuthRepository";
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
let pendingLoginEmail: string | null = null;

/** Stands in for the real Xano-backed AuthRepository until a role's real API contract is confirmed. Mirrors the real two-phase login shape (any code verifies successfully) so screens built against it behave like the real thing. */
export class MockAuthRepository implements AuthRepository {
  async checkAge(_birthYear: number): Promise<void> {
    return delay(undefined);
  }

  async register(_input: RegisterInput): Promise<RegisterResult> {
    await delay(undefined);
    return { userId: "mock-user-1", accountStatus: "pending_verification" };
  }

  async login(input: LoginInput): Promise<LoginResult> {
    await delay(undefined);
    pendingLoginEmail = input.email;
    return { status: "otp_required" };
  }

  async verifyOtp(_code: string): Promise<AuthSession> {
    const user: AuthUser = pendingLoginEmail ? { ...MOCK_USER, email: pendingLoginEmail } : MOCK_USER;
    currentUser = user;
    pendingLoginEmail = null;
    return delay({ user, token: "mock-token" });
  }

  async loginWithGoogle(_profile: GoogleProfileInput): Promise<AuthSession> {
    currentUser = MOCK_USER;
    return delay({ user: MOCK_USER, token: "mock-google-token" });
  }

  async requestPasswordReset(_identifier: string): Promise<void> {
    return delay(undefined);
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return delay(currentUser);
  }

  async getNextStep(): Promise<NextStep | null> {
    return delay(currentUser ? "HOME" : null);
  }

  async getAuthMe(): Promise<AuthMeResponse | null> {
    if (!currentUser) return delay(null);
    return delay({
      nextStep: "HOME",
      welcomeSeen: true,
      registrationProgress: 100,
      profileChecklist: [],
      branding: null,
    });
  }

  async acknowledgeWelcome(): Promise<NextStep | null> {
    return delay(currentUser ? "HOME" : null);
  }

  async logout(): Promise<void> {
    currentUser = null;
    pendingLoginEmail = null;
    return delay(undefined);
  }
}
