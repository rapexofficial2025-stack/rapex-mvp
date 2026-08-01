import type { WalletSummary } from "../types";

export interface WalletRepository {
  getWalletSummary(): Promise<WalletSummary>;
}
