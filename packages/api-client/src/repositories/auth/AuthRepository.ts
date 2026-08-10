import type { AuthSession, AuthUser } from "../types";

export type RegisterInput = { name: string; email: string; phone: string; password: string };
export type LoginInput = { email: string; password: string };

export interface AuthRepository {
  register(input: RegisterInput): Promise<AuthSession>;
  login(input: LoginInput): Promise<AuthSession>;
  requestOtp(destination: string): Promise<void>;
  verifyOtp(destination: string, code: string): Promise<AuthSession>;
  getCurrentUser(): Promise<AuthUser | null>;
  logout(): Promise<void>;
}
