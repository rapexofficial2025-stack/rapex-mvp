import type { RiderWalletSummary } from "../types";

export interface RiderWalletRepository {
  getRiderWalletSummary(): Promise<RiderWalletSummary>;
  topUpOperational(amount: number): Promise<RiderWalletSummary>;
  requestRemittance(amount: number): Promise<RiderWalletSummary>;
}
